import { Observable } from 'rxjs';

import { ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseRoutableViewModel } from '../../React';

export interface TabsRoutingState {
  tab: number;
}

export class TabsViewModel<T> extends BaseRoutableViewModel<TabsRoutingState> {
  public static displayName = 'TabsViewModel';

  public readonly tabs: ReadOnlyProperty<T[]>;
  public readonly selectedTab: ReadOnlyProperty<T>;
  public readonly selectedIndex: ReadOnlyProperty<number>;

  public readonly addTab: Command<T>;
  public readonly removeTab: Command<T | number>;
  public readonly selectTab: Command<T>;
  public readonly selectIndex: Command<number>;

  constructor(initialTabs: T[] = [], isRoutingEnabled = false) {
    super(isRoutingEnabled);

    const tabs = this.wx.property<T[]>(initialTabs, false);
    this.tabs = <ReadOnlyProperty<T[]>>tabs;

    this.addTab = this.wx.command((tab: T) => {
      tabs.value = this.tabs.value.concat(tab);
      return tab;
    });

    this.removeTab = this.wx.command((tab: T | number) => {
      tabs.value = Number.isNumeric(tab) ?
        this.tabs.value.filter((x, i) => i !== tab) :
        this.tabs.value.filter(x => x !== tab);
      return tab;
    });

    this.selectTab = this.wx.command<T>();
    this.selectIndex = this.wx.command<number>();

    this.selectedTab = this.wx
      .whenAny(this.selectIndex.results, x => this.tabs.value[x])
      .toProperty();

    this.selectedIndex = this.wx
      .whenAny(this.selectIndex.results, x => x)
      .toProperty();

    this.addSubscription(this.selectTab.results
      .map(x => this.tabs.value.indexOf(x))
      .invokeCommand(this.selectIndex),
    );

    this.addSubscription(
      this.wx
        .whenAny(this.tabs.changed, x => ({ i: this.selectedIndex.value, l: x.length }))
        .filter(x => x.l > 0 && (x.i == null || x.i < 0 || x.i >= x.l))
        .map(x => x.l - 1)
        .invokeCommand(this.selectIndex),
    );

    this.addSubscription(
      this.wx
        .whenAny(this.selectedIndex, x => x)
        .invokeCommand(this.routingStateChanged),
    );
  }

  saveRoutingState(state: TabsRoutingState) {
    if (this.selectedIndex.value !== 0) {
      state.tab = this.selectedIndex.value;
    }
  }

  loadRoutingState(state: TabsRoutingState) {
    const prevState = this.routingState.value || <TabsRoutingState>{};

    if (state.tab == null && prevState.tab != null) {
      state.tab = 0;
    }

    this.selectIndex.execute(state.tab || this.selectedIndex.value || 0);
  }
}
