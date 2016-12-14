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
    items?: wx.ObservableOrProperty<TData[]>,
    filterer?: (item: TData, regex: RegExp) => boolean,
    comparer?: ObjectComparer<TData>,
    isMultiSelectEnabled?: boolean,
    isLoading?: wx.ObservableOrProperty<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(
      new DataGridViewModel<TData>(items, filterer, comparer, isMultiSelectEnabled, isLoading, pagerLimit, rateLimit, isRoutingEnabled),
      isRoutingEnabled
    );
  }
}
