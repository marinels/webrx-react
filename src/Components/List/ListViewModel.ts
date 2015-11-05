'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class ListViewModel<T> extends BaseViewModel {
  public static displayName = 'ListViewModel';

  constructor(initialContents?: T[]) {
    super();

    this.items = wx.list(initialContents);
  }

  public items: wx.IObservableList<T>;
  public selectedItem = wx.property<any>();
  public selectedIndex = wx.property<number>();

  public selectItem = wx.command((x: number) => {
    if (x >= 0 && x < this.items.length()) {
      this.selectedItem(this.items.get(x));
      this.selectedIndex(x);
    }
  });
}

export default ListViewModel;
