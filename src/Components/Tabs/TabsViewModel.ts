'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class TabsViewModel extends BaseViewModel {
  constructor(initialContents?: any[]) {
    super();

    this.items = wx.list(initialContents);
  }

  public items: wx.IObservableList<any>;
  public selectedItem = wx.property<any>();
  public selectedIndex = wx.property<number>();

  public selectTab = wx.command((x: number) => {
    if (x >= 0 && x < this.items.length()) {
      this.selectedItem(this.items.get(x));
      this.selectedIndex(x);
    }
  });
}

export default TabsViewModel;
