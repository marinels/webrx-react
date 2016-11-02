import * as Rx from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { DataGridViewModel } from '../DataGrid/DataGridViewModel';
import { ObjectComparer } from '../../../Utils/Compare';

export class ItemListPanelViewModel<TData> extends BaseRoutableViewModel<any> {
  public static displayName = 'ItemListPanelViewModel';

  public grid: DataGridViewModel<TData>;
  public navigate: wx.ICommand<TData>;

  public static create<TData>(...items: TData[]) {
    return new ItemListPanelViewModel(wx.property(items));
  }

  constructor(
    items?: wx.IObservableProperty<TData[]>,
    filterer?: (item: TData, regex: RegExp) => boolean,
    comparer?: ObjectComparer<TData>,
    public isLoading: boolean | wx.IObservableProperty<boolean> = false,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super();

    this.grid = new DataGridViewModel<TData>(items, filterer, comparer, isMultiSelectEnabled, rateLimit, isRoutingEnabled);
    this.navigate = wx.asyncCommand((x: TData) => Rx.Observable.return(x));
  }

  public get items() {
    return this.grid.items();
  }

  public get itemsChanged() {
    return this.grid.items.changed;
  }

  public get lengthChanged() {
    return this.itemsChanged
      .map(x => (x || []).length)
      .distinctUntilChanged();
  }

  public get search() {
    return this.grid.search;
  }

  getSearch() {
    return this.grid.getSearch();
  }
}
