import { Observable } from 'rxjs';

import { ObservableLike, ReadOnlyProperty } from '../../../WebRx';
import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { AsyncDataGridViewModel, isAsyncDataSource, AsyncDataSource } from '../DataGrid/AsyncDataGridViewModel';
import { ProjectionRequest, ProjectionResult } from '../DataGrid/DataGridViewModel';

export class AsyncItemListPanelViewModel<TData, TItem, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TItem>> extends BaseItemListPanelViewModel<TData, TItem, TRequest, TResult, AsyncDataGridViewModel<TData, TItem, TRequest, TResult>> {
  public static displayName = 'AsyncItemListPanelViewModel';

  constructor(
    dataSourceOrViewModel: AsyncDataSource<TRequest, TResult> | AsyncDataGridViewModel<TData, TItem, TRequest, TResult>,
    enableFilter?: boolean,
    enableSort?: boolean,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    const grid = isAsyncDataSource(dataSourceOrViewModel) ?
      new AsyncDataGridViewModel<TData, TItem, TRequest, TResult>(
        dataSourceOrViewModel,
        enableFilter,
        enableSort,
        isMultiSelectEnabled,
        isLoading,
        pagerLimit,
        rateLimit,
        isRoutingEnabled,
      ) :
      dataSourceOrViewModel;

    super(grid, isRoutingEnabled);
  }

  public get items() {
    return this.grid.projectedItems;
  }

  public get lengthChanged() {
    return this
      .whenAny(this.grid.pager.itemCount, x => x)
      .distinctUntilChanged();
  }
}

export class SimpleAsyncItemListPanelViewModel<TData, TRequest extends ProjectionRequest> extends AsyncItemListPanelViewModel<TData, TData, TRequest, ProjectionResult<TData>> {
  public static displayName = 'SimpleAsyncItemListPanelViewModel';
}
