'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class ListViewModel<T> extends BaseViewModel {
  public static displayName = 'ListViewModel';

  constructor(...items: T[]) {
    super();

    if (items.length > 0) {
      this.items.addRange(items);
    }
  }

  public items = wx.list<T>();
  public selectIndex = wx.asyncCommand((x: number) => Rx.Observable.return(x));
  public selectItem = wx.asyncCommand((x: T) => Rx.Observable.return(x));
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = Rx.Observable
    .merge(
      this.selectItem.results,
      this.selectedIndex.changed
        .where(x => x >= 0 && x < this.items.length())
        .select(x => this.items.get(x))
    )
    .toProperty();
}

export default ListViewModel;
