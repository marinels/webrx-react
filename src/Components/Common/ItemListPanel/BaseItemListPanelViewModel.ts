import * as Rx from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { DataGridViewModel } from '../DataGrid/DataGridViewModel';

export abstract class BaseItemListPanelViewModel<TData, TGrid extends DataGridViewModel<TData>> extends BaseRoutableViewModel<any> {
  public static displayName = 'BaseItemListPanelViewModel';

  public navigate: wx.ICommand<TData>;

  constructor(
    public grid: TGrid,
    isRoutingEnabled?: boolean
  ) {
    super(isRoutingEnabled);

    this.navigate = wx.asyncCommand((x: TData) => Rx.Observable.return(x));
  }

  public get isLoading() {
    return this.grid.isLoading;
  }

  public get items() {
    return this.grid.items;
  }

  public get lengthChanged() {
    return wx
      .whenAny(this.items, x => (x || []).length)
      .distinctUntilChanged();
  }

  public get selectedItem() {
    return this.grid.selectedItem;
  }

  public get selectItem() {
    return this.grid.selectItem;
  }

  getSearch() {
    return this.grid.getSearch();
  }
}
