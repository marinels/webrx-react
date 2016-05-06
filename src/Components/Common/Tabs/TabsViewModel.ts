'use strict';

import * as wx from 'webrx';

import BaseRoutableViewModel from '../../React/BaseRoutableViewModel';

export interface ITabsRoutingState {
  tab: number;
}

export class TabsViewModel extends BaseRoutableViewModel<ITabsRoutingState> {
  public static displayName = 'TabsViewModel';

  public items = wx.list();
  public selectIndex = wx.command();
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = this.selectedIndex.changed
    .where(x => x >= 0 && x < this.items.length())
    .select(x => this.items.get(x))
    .toProperty();

  constructor(isRoutingEnabled = false, ...items: any[]) {
    super(isRoutingEnabled);

    if (this.items.length() > 0) {
      this.items.addRange(items);

      this.selectIndex.execute(0);
    }
  }

  initialize() {
    super.initialize();

    this.subscribe(this.selectedIndex
      .changed
      .invokeCommand(this.routingStateChanged));
  }

  saveRoutingState(state: ITabsRoutingState) {
    if (this.selectedIndex() !== 0) {
      state.tab = this.selectedIndex();
    }

    super.saveRoutingState(state);
  }

  loadRoutingState(state: ITabsRoutingState) {
    this.selectIndex.execute(state.tab || this.selectedIndex() || 0);

    super.loadRoutingState(state);
  }
}

export default TabsViewModel;
