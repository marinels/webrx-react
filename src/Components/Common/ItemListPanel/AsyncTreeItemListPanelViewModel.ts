import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { ObservableOrValue, ObservableLike, IterableLike } from '../../../WebRx';
import { ItemListPanelContext } from './ItemListPanelViewModel';
import { TreeItemListPanelViewModel } from './TreeItemListPanelViewModel';
import { DataSourceRequest, DataSourceResponse } from '../DataGrid/DataGridViewModel';
import { AsyncDataGridViewModel } from '../DataGrid/AsyncDataGridViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';

export class AsyncTreeItemListPanelViewModel<T, TRequestContext = any> extends TreeItemListPanelViewModel<T, TRequestContext> {
  public static displayName = 'AsyncTreeItemListPanelViewModel';

  /**
   * @param responseSelector delegate that produces a response from a request.
   * @param itemsSource delegate to produce sub-items from a source item.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param context request context included in projection requests. if included requests are bound to context events.
   */
  constructor(
    protected readonly responseSelector: (request: DataSourceRequest<ItemListPanelContext<TRequestContext>> | undefined) => ObservableOrValue<DataSourceResponse<T> | undefined>,
    itemsSource: (item: T) => (IterableLike<T> | undefined),
    search?: SearchViewModel | null,
    context?: ObservableLike<TRequestContext>,
    rateLimit = AsyncDataGridViewModel.DefaultRateLimit,
  ) {
    super(Iterable.empty<T>(), itemsSource, x => x, undefined, search, context, rateLimit);
  }

  getResponse(request: DataSourceRequest<ItemListPanelContext<TRequestContext>> | undefined) {
    return this.responseSelector(request);
  }
}
