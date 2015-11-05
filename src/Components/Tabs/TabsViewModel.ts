'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class TabsViewModel extends BaseViewModel {
  public static displayName = 'TabsViewModel';

  constructor(initialContents?: any[]) {
    super();

    this.items = wx.list(initialContents);

    if (this.items.length() > 0) {
      this.selectIndex.execute(0);
    }
  }

  public items: wx.IObservableList<any>;
  public selectIndex = wx.asyncCommand((x: number) => Rx.Observable.return(x));
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = this.selectedIndex.changed
    .where(x => x >= 0 && x < this.items.length())
    .select(x => this.items.get(x))
    .toProperty();
}

export default TabsViewModel;
