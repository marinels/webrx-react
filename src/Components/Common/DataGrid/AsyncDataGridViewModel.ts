import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableLike, ObservableOrValue, ReadOnlyProperty, Command } from '../../../WebRx';
import { DataGridViewModel, DataSourceRequest, DataSourceResponse } from './DataGridViewModel';
import { PagerViewModel } from '../Pager/PagerViewModel';

export class AsyncDataGridViewModel<T, TRequestContext = any> extends DataGridViewModel<T, TRequestContext> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    protected readonly responseSelector: (request: DataSourceRequest<TRequestContext> | undefined) => ObservableOrValue<DataSourceResponse<T> | undefined>,
    pager?: PagerViewModel,
    context?: ObservableLike<TRequestContext>,
  ) {
    super(Iterable.empty<T>(), pager, context);
  }

  getResponse(request: DataSourceRequest | undefined) {
    if (this.responseSelector == null) {
      return undefined;
    }

    return this.responseSelector(request);
  }
}
