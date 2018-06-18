import { Iterable } from 'ix';

import { ObservableLike, ObservableOrValue } from '../../../WebRx';
import {
  AsyncDataGridViewModel,
  DataSourceResponseSelector,
} from '../DataGrid/AsyncDataGridViewModel';
import {
  DataSourceRequest,
  DataSourceResponse,
} from '../DataGrid/DataGridViewModel';
import { PagerViewModel } from '../Pager/PagerViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';
import {
  ItemListPanelContext,
  ItemListPanelViewModel,
} from './ItemListPanelViewModel';

export class AsyncItemListPanelViewModel<
  T,
  TRequestContext = any
> extends ItemListPanelViewModel<T, TRequestContext> {
  public static displayName = 'AsyncItemListPanelViewModel';

  /**
   * @param responseSelector delegate that produces a response from a request.
   * @param filterer filter predicate. executed for each item when the search context is available.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param pager pager. if omitted a default pager will be created. use null for no pager.
   * @param context request context included in projection requests. if included requests are bound to context events.
   */
  constructor(
    protected readonly responseSelector: DataSourceResponseSelector<
      T,
      TRequestContext
    >,
    search?: SearchViewModel | null,
    pager?: PagerViewModel | null,
    context?: ObservableLike<TRequestContext>,
    rateLimit = AsyncDataGridViewModel.DefaultRateLimit,
  ) {
    super(
      Iterable.empty<T>(),
      undefined,
      search,
      pager,
      context,
      undefined,
      rateLimit,
    );
  }

  getResponse(
    request:
      | DataSourceRequest<ItemListPanelContext<TRequestContext>>
      | undefined,
  ) {
    return this.responseSelector(request);
  }
}
