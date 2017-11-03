import { Observable } from 'rxjs';

import { ObservableLike, ReadOnlyProperty } from '../../../WebRx';
import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { AsyncDataGridViewModel, isAsyncDataSource, AsyncDataSource } from '../DataGrid/AsyncDataGridViewModel';
import { ProjectionRequest, ProjectionResult } from '../DataGrid/DataGridViewModel';

export class AsyncItemListPanelViewModel<TData, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TData>> extends BaseItemListPanelViewModel<TData, TRequest, TResult, AsyncDataGridViewModel<TData, TRequest, TResult>> {
  public static displayName = 'AsyncItemListPanelViewModel';

  constructor(
    dataSourceOrViewModel: AsyncDataSource<TRequest, TResult> | AsyncDataGridViewModel<TData, TRequest, TResult>,
    enableFilter?: boolean,
    enableSort?: boolean,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    const grid = isAsyncDataSource(dataSourceOrViewModel) ?
      new AsyncDataGridViewModel<TData, TRequest, TResult>(dataSourceOrViewModel, enableFilter, enableSort, isMultiSelectEnabled, isLoading, pagerLimit, rateLimit, isRoutingEnabled) :
      dataSourceOrViewModel;

    super(grid, isRoutingEnabled);
  }

  public get items() {
    return this.grid.projectedItems;
  }

  public get lengthChanged() {
    return this.wx
      .whenAny(this.grid.pager.itemCount, x => x)
      .distinctUntilChanged();
  }
}

export class BasicAsyncItemListPanelViewModel<TData, TRequest extends ProjectionRequest> extends AsyncItemListPanelViewModel<TData, TRequest, ProjectionResult<TData>> {
  public static displayName = 'BasicAsyncItemListPanelViewModel';
}
