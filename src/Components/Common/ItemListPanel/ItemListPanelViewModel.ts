import * as wx from 'webrx';

import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { DataGridViewModel } from '../DataGrid/DataGridViewModel';
import { ObjectComparer } from '../../../Utils/Compare';

export class ItemListPanelViewModel<TData> extends BaseItemListPanelViewModel<TData, DataGridViewModel<TData>> {
  public static displayName = 'ItemListPanelViewModel';

  public static create<TData>(...items: TData[]) {
    return new ItemListPanelViewModel(wx.property(items));
  }

  constructor(
    items?: wx.IObservableProperty<TData[]>,
    filterer?: (item: TData, regex: RegExp) => boolean,
    comparer?: ObjectComparer<TData>,
    isLoading?: boolean | wx.IObservableProperty<boolean>,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(
      new DataGridViewModel<TData>(items, filterer, comparer, isMultiSelectEnabled, rateLimit, isRoutingEnabled),
      isLoading, isRoutingEnabled
    );
  }
}
