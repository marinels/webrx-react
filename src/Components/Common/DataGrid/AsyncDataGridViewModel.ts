import { Observable } from 'rx';

import { ObservableOrProperty } from '../../../WebRx';
import { BaseDataGridViewModel, ProjectionRequest, ProjectionResult } from './DataGridViewModel';

export interface AsyncDataSource<TRequest extends ProjectionRequest, TResult extends ProjectionResult<any>> {
  requests: Observable<TRequest>;
  getResultAsync(request: TRequest): Observable<TResult>;
}

export interface BasicAsyncDataSource<TRequest extends ProjectionRequest, TData> extends AsyncDataSource<TRequest, ProjectionResult<TData>> {
}

export function isAsyncDataSource(source: any): source is AsyncDataSource<any, any> {
  const dataSource = <AsyncDataSource<any, any>>source;
  if (dataSource != null && Observable.isObservable(dataSource.requests) && dataSource.getResultAsync instanceof Function) {
    return true;
  }
  else {
    return false;
  }
}

export class AsyncDataGridViewModel<TData, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TData>> extends BaseDataGridViewModel<TData, TRequest, TResult> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    protected readonly dataSource: AsyncDataSource<TRequest, TResult>,
    protected readonly enableFilter = false,
    protected readonly enableSort = false,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableOrProperty<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    super(dataSource.requests, undefined, undefined, undefined, isMultiSelectEnabled, isLoading, pagerLimit, rateLimit, isRoutingEnabled);
  }

  getProjectionResult(request: TRequest) {
    // this will first clear the selected item before fetching the async result
    return this.selectItem.observeExecution(null)
      .flatMap(() => this.dataSource.getResultAsync(request));
  }

  canFilter() {
    return this.enableFilter;
  }

  canSort() {
    return this.enableSort;
  }
}

export class BasicAsyncDataGridViewModel<TData, TRequest extends ProjectionRequest> extends AsyncDataGridViewModel<TData, TRequest, ProjectionResult<TData>> {
  public static displayName = 'BasicAsyncDataGridViewModel';
}
