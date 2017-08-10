import { Observable } from 'rxjs';

import { wx, ObservableLike } from '../../../WebRx';
import { BaseDataGridViewModel, ProjectionRequest, ProjectionResult } from './DataGridViewModel';

export interface AsyncDataSource<TRequest extends ProjectionRequest, TResult extends ProjectionResult<any>> {
  requests: Observable<TRequest>;
  getResultAsync(request: TRequest): Observable<TResult>;
}

export interface SimpleAsyncDataSource<TRequest extends ProjectionRequest, TData> extends AsyncDataSource<TRequest, ProjectionResult<TData>> {
}

export function isAsyncDataSource(source: any): source is AsyncDataSource<any, any> {
  const dataSource = <AsyncDataSource<any, any>>source;
  if (dataSource != null && wx.isObservable(dataSource.requests) && dataSource.getResultAsync instanceof Function) {
    return true;
  }
  else {
    return false;
  }
}

export class AsyncDataGridViewModel<TData, TItem, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TItem>> extends BaseDataGridViewModel<TData, TItem, TRequest, TResult> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    protected readonly asyncDataSource: AsyncDataSource<TRequest, TResult>,
    protected readonly enableFilter = false,
    protected readonly enableSort = false,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    super(
      Observable.never<TData[]>(),
      () => asyncDataSource.requests,
      undefined,
      undefined,
      isMultiSelectEnabled,
      isLoading,
      pagerLimit,
      rateLimit,
      isRoutingEnabled,
    );
  }

  getProjectionResult(request: TRequest) {
    // this will first clear the selected item before fetching the async result
    return this.selectItem.observeExecution(null)
      .flatMap(() => this.asyncDataSource.getResultAsync(request));
  }

  canFilter() {
    return this.enableFilter;
  }

  canSort() {
    return this.enableSort;
  }
}

export class SimpleAsyncDataGridViewModel<TData, TRequest extends ProjectionRequest> extends AsyncDataGridViewModel<TData, TData, TRequest, ProjectionResult<TData>> {
  public static displayName = 'SimpleAsyncDataGridViewModel';
}
