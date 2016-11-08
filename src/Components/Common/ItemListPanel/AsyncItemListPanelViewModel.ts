import * as wx from 'webrx';

import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { AsyncDataGridViewModel, AsyncDataSource, AsyncDataResult } from '../DataGrid/AsyncDataGridViewModel';

export class AsyncItemListPanelViewModel<TData, TResult extends AsyncDataResult<TData>> extends BaseItemListPanelViewModel<TData, AsyncDataGridViewModel<TData, TResult>> {
  public static displayName = 'AsyncItemListPanelViewModel';

  constructor(
    dataSourceOrViewModel: AsyncDataSource<TData, TResult> | AsyncDataGridViewModel<TData, TResult>,
    enableFilter?: boolean,
    enableSort?: boolean,
    isLoading?: boolean | wx.IObservableProperty<boolean>,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    const dataSource = <AsyncDataSource<TData, TResult>>dataSourceOrViewModel;
    let dataGridViewModel = <AsyncDataGridViewModel<TData, TResult>>dataSourceOrViewModel;

    if (dataGridViewModel.asyncResult == null) {
      dataGridViewModel = new AsyncDataGridViewModel(dataSource, enableFilter, enableSort, isMultiSelectEnabled, rateLimit, isRoutingEnabled);
    }

    super(dataGridViewModel, isLoading, isRoutingEnabled);
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
