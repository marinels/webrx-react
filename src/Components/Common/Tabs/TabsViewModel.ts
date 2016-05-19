import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface ITabsRoutingState {
  tab: number;
}

export class TabsViewModel<T> extends BaseRoutableViewModel<ITabsRoutingState> {
  public static displayName = 'TabsViewModel';

  public items = wx.list<T>();
  public selectIndex = wx.asyncCommand<number>(x => Rx.Observable.return(x));
  public selectedIndex = this.selectIndex.results
    .toProperty();
  public selectedItem = this.selectedIndex.changed
    .where(x => x >= 0 && x < this.items.length())
    .select(x => this.items.get(x))
    .toProperty();

  constructor(isRoutingEnabled = false, ...items: T[]) {
    super(isRoutingEnabled);

    if (this.items.length() > 0) {
      this.items.addRange(items);

      this.selectIndex.execute(0);
    }
  }

  initialize() {
    this.subscribe(this.selectedIndex
      .changed
      .invokeCommand(this.routingStateChanged));
  }

  saveRoutingState(state: ITabsRoutingState) {
    if (this.selectedIndex() !== 0) {
      state.tab = this.selectedIndex();
    }
  }

  loadRoutingState(state: ITabsRoutingState) {
    this.selectIndex.execute(state.tab || this.selectedIndex() || 0);
  }
}
