import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface TabsRoutingState {
  tab: number;
}

export class TabsViewModel<T> extends BaseRoutableViewModel<TabsRoutingState> {
  public static displayName = 'TabsViewModel';

  public items = wx.list<T>();
  public selectIndex = wx.asyncCommand<number>(x => Observable.of(x));
  public selectedIndex = this.selectIndex.results
    .toProperty();
  public selectedItem = this.selectedIndex.changed
    .where(x => x >= 0 && x < this.items.length())
    .select(x => this.items.get(x))
    .toProperty();

  constructor(isRoutingEnabled = false, ...items: T[]) {
    super(isRoutingEnabled);

    this.subscribe(this.selectedIndex
      .changed
      .invokeCommand(this.routingStateChanged));

    if (this.items.length() > 0) {
      this.items.addRange(items);

      this.selectIndex.execute(0);
    }
  }

  saveRoutingState(state: TabsRoutingState) {
    if (this.selectedIndex() !== 0) {
      state.tab = this.selectedIndex();
    }
  }

  loadRoutingState(state: TabsRoutingState) {
    this.selectIndex.execute(state.tab || this.selectedIndex() || 0);
  }
}
