import * as wx from 'webrx';

import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { AsyncDataGridViewModel, AsyncDataSource, AsyncDataResult } from '../DataGrid/AsyncDataGridViewModel';

export class AsyncItemListPanelViewModel<TData, TResult extends AsyncDataResult<TData>> extends BaseItemListPanelViewModel<TData> {
  public static displayName = 'AsyncItemListPanelViewModel';

  constructor(
    dataSource: AsyncDataSource<TData, TResult>,
    enableFilter?: boolean,
    enableSort?: boolean,
    isLoading?: boolean | wx.IObservableProperty<boolean>,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(
      new AsyncDataGridViewModel(dataSource, enableFilter, enableSort, isMultiSelectEnabled, rateLimit, isRoutingEnabled),
      isLoading, isRoutingEnabled
    );
  }

  public get items() {
    return this.grid.projectedItems;
  }

  public get lengthChanged() {
    return wx
      .whenAny(this.grid.pager.itemCount, x => x)
      .distinctUntilChanged();
  }
}
