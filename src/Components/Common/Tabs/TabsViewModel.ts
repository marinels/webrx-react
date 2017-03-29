import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface TabsRoutingState {
  tab: number;
}

export class TabsViewModel<T> extends BaseRoutableViewModel<TabsRoutingState> {
  public static displayName = 'TabsViewModel';

  public tabs: wx.IObservableReadOnlyProperty<T[]>;
  public selectedTab: wx.IObservableReadOnlyProperty<T>;
  public selectedIndex: wx.IObservableReadOnlyProperty<number>;

  public addTab: wx.ICommand<T>;
  public removeTab: wx.ICommand<T | number>;
  public selectTab: wx.ICommand<T>;
  public selectIndex: wx.ICommand<number>;

  constructor(initialTabs: T[] = [], isRoutingEnabled = false) {
    super(isRoutingEnabled);

    const tabs = wx.property<T[]>([]);
    this.tabs = <wx.IObservableReadOnlyProperty<T[]>>tabs;

    this.addTab = wx.asyncCommand((tab: T) => {
      this.tabs(this.tabs().concat([ tab ]));
      return Observable.of(tab);
    });

    this.removeTab = wx.asyncCommand((tab: T | number) => {
      this.tabs(
        Number.isNumeric(tab) ?
          this.tabs().filter((x, i) => i !== tab) :
          this.tabs().filter(x => x !== tab),
      );
      return Observable.of(tab);
    });

    this.selectTab = wx.asyncCommand((x: T) => Observable.of(x));
    this.selectIndex = wx.asyncCommand((x: number) => Observable.of(x));

    this.selectedTab = wx
      .whenAny(this.selectIndex.results, x => this.tabs()[x])
      .toProperty();

    this.selectedIndex = wx
      .whenAny(this.selectIndex.results, x => x)
      .toProperty();

    this.subscribe(this.selectTab.results
      .map(x => this.tabs().indexOf(x))
      .invokeCommand(this.selectIndex),
    );

    this.subscribe(wx
      .whenAny(this.tabs.changed, x => ({ i: this.selectedIndex(), l: x.length }))
      .filter(x => x.l > 0 && (x.i == null || x.i < 0 || x.i >= x.l))
      .map(x => x.l - 1)
      .invokeCommand(this.selectIndex),
    );

    this.subscribe(wx
      .whenAny(this.selectedIndex, x => x)
      .invokeCommand(this.routingStateChanged),
    );
  }

  saveRoutingState(state: TabsRoutingState) {
    if (this.selectedIndex() !== 0) {
      state.tab = this.selectedIndex();
    }
  }

  loadRoutingState(state: TabsRoutingState) {
    const prevState = this.routingState() || <TabsRoutingState>{};

    if (state.tab == null && prevState.tab != null) {
      state.tab = 0;
    }

    this.selectIndex.execute(state.tab || this.selectedIndex() || 0);
  }
}
