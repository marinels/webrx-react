import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { ObservableOrValue, ObservableLike } from '../../../WebRx';
import { ItemListPanelViewModel, ItemListPanelContext } from './ItemListPanelViewModel';
import { DataSourceRequest, DataSourceResponse } from '../DataGrid/DataGridViewModel';
import { SearchViewModel, SearchRequest } from '../Search/SearchViewModel';
import { PagerViewModel } from '../Pager/PagerViewModel';

export class AsyncItemListPanelViewModel<T, TRequestContext = any> extends ItemListPanelViewModel<T, TRequestContext> {
  public static displayName = 'AsyncItemListPanelViewModel';

  /**
   * @param responseSelector delegate that produces a response from a request.
   * @param filterer filter predicate. executed for each item when the search context is available.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param pager pager. if omitted a default pager will be created. use null for no pager.
   * @param context request context included in projection requests. if included requests are bound to context events.
   */
  constructor(
    protected readonly responseSelector: (request: DataSourceRequest<ItemListPanelContext<TRequestContext>> | undefined) => ObservableOrValue<DataSourceResponse<T> | undefined>,
    filterer?: (item: T, search: SearchRequest) => boolean,
    search?: SearchViewModel | null,
    pager?: PagerViewModel | null,
    context?: ObservableLike<TRequestContext>,
  ) {
    super(Iterable.empty<T>(), filterer, search, pager, context);
  }

  getResponse(request: DataSourceRequest<ItemListPanelContext<TRequestContext>> | undefined) {
    return this.responseSelector(request);
  }
}
