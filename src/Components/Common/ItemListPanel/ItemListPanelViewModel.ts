import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableOrValue, ObservableLike } from '../../../WebRx';
import { DataGridViewModel, DataSourceRequest, DataSourceResponse } from '../DataGrid/DataGridViewModel';
import { SearchViewModel, SearchRequest } from '../Search/SearchViewModel';
import { ObjectComparer } from '../../../Utils/Compare';
import { PagerViewModel } from '../Pager/PagerViewModel';

export interface ItemListPanelRequestContext {
  search?: SearchRequest;
}

export type ItemListPanelContext<TRequestContext> = ItemListPanelRequestContext & TRequestContext;

export class ItemListPanelViewModel<T, TRequestContext = any> extends DataGridViewModel<T, ItemListPanelContext<TRequestContext>> {
  public static displayName = 'ItemListPanelViewModel';

  protected static getItemListPanelSearch(search: SearchViewModel | undefined | null) {
    return search === null ? null : (search || new SearchViewModel());
  }

  protected static createItemListPanelContext(search: SearchRequest): ItemListPanelRequestContext {
    return {
      search,
    };
  }

  protected static getItemListPanelContext(search: SearchViewModel | null): Observable<ItemListPanelRequestContext> {
    return search == null ?
      Observable.of({}) :
      this.wx
        .whenAny(search.requests, x => x)
        .map(x => ItemListPanelViewModel.createItemListPanelContext(x));
  }

  protected static getDataGridContext<TRequestContext>(
    search: SearchViewModel | null,
    context?: ObservableLike<TRequestContext>,
  ): Observable<ItemListPanelContext<TRequestContext>> {
    const itemListPanelContext = ItemListPanelViewModel.getItemListPanelContext(search);

    if (context == null) {
      // no custom context supplied so just use the standard item list panel context
      return <Observable<ItemListPanelContext<TRequestContext>>>itemListPanelContext;
    }

    return this.wx
      .whenAny(
        itemListPanelContext,
        context,
        (ilpCtx, userCtx) => Object.assign({}, ilpCtx, userCtx),
      );
  }

  public static getSearchRequest<TRequestContext>(request: DataSourceRequest<ItemListPanelContext<TRequestContext>>) {
    if (
      request.context == null ||
      request.context.search == null ||
      request.context.search.regex == null
    ) {
      return undefined;
    }

    return request.context.search;
  }

  public static filterItems<T>(
    items: Iterable<T>,
    searchRequest: SearchRequest,
    filterer: (item: T, search: SearchRequest) => boolean,
  ) {
    return items
      .filter(x => filterer(x, searchRequest));
  }

  protected readonly filterer: undefined | ((item: T, search: SearchRequest) => boolean);
  public readonly search: SearchViewModel | null;

  /**
   * @param source data source. if omitted no data will ever be loaded.
   * @param filterer filter predicate. executed for each item when the search context is available.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param pager pager. if omitted a default pager will be created. use null for no pager.
   * @param context request context included in projection requests. if included requests are bound to context events.
   * @param comparer custom object comparer. if omitted a default object comparer will be used.
   */
  constructor(
    source?: ObservableLike<IterableLike<T>>,
    filterer?: (item: T, search: SearchRequest) => boolean,
    search?: SearchViewModel | null,
    pager?: PagerViewModel | null,
    context?: ObservableLike<TRequestContext>,
    comparer?: string | ObjectComparer<T>,
  ) {
    // create the effective search view model (or null if omitted)
    search = ItemListPanelViewModel.getItemListPanelSearch(search);

    // initialize the data grid with a composite context observable
    super(source, pager, ItemListPanelViewModel.getDataGridContext(search, context), comparer);

    this.filterer = filterer;
    this.search = search;
  }

  getResponseFromItems(items: Iterable<T>, request: DataSourceRequest<ItemListPanelContext<TRequestContext>>): ObservableOrValue<DataSourceResponse<T> | undefined> {
    // if no filterer was defined then just return default response
    if (this.filterer == null) {
      return super.getResponseFromItems(items, request);
    }

    // try and extract the search request
    const searchRequest = ItemListPanelViewModel.getSearchRequest(request);

    // if no search request was involved then return the default response
    if (searchRequest == null) {
      return super.getResponseFromItems(items, request);
    }

    // filter the items according to the search request involved
    const filteredItems = this.getFilteredItems(items, searchRequest);

    // generate a response from the filtered items
    return super.getResponseFromItems(filteredItems, request);
  }

  protected getFilteredItems(items: Iterable<T>, searchRequest: SearchRequest) {
    return ItemListPanelViewModel.filterItems(items, searchRequest, this.filterer!);
  }
}
