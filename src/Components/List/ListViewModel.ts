'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class ListViewModel<T> extends BaseViewModel {
  public items: wx.IObservableList<T>;
  public selectedItem: wx.IObservableProperty<T>;
  public selectedIndex: wx.IObservableProperty<number>;

  public selectItem = wx.command((x: number) => {
    if (x >= 0 && x < this.items.length()) {
      this.selectedItem(this.items.get(x));
      this.selectedIndex(x);
    }
  });
}

export default ListViewModel;
