import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableLike, ObservableOrValue, ReadOnlyProperty, Command } from '../../../WebRx';
import { DataGridViewModel, DataSourceRequest, DataSourceResponse } from './DataGridViewModel';
import { PagerViewModel } from '../Pager/PagerViewModel';

export class AsyncDataGridViewModel<T, TRequestContext = any> extends DataGridViewModel<T, TRequestContext> {
  public static displayName = 'AsyncDataGridViewModel';

  /**
   * @param responseSelector delegate that produces a response from a request.
   * @param pager pager. if omitted a default pager will be created. use null for no pager.
   * @param context request context included in projection requests. if included requests are bound to context events.
   */
  constructor(
    protected readonly responseSelector: (request: DataSourceRequest<TRequestContext> | undefined) => ObservableOrValue<DataSourceResponse<T> | undefined>,
    pager?: PagerViewModel,
    context?: ObservableLike<TRequestContext>,
  ) {
    super(Iterable.empty<T>(), pager, context);
  }

  getResponse(request: DataSourceRequest | undefined) {
    return this.responseSelector(request);
  }
}
