import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableOrValue, ObservableLike } from '../../../WebRx';
import { RoutingStateHandler, HandlerRoutingStateChanged } from '../../React';
import { DataGridViewModel, DataSourceRequest, DataSourceResponse, DataGridRoutingState } from '../DataGrid/DataGridViewModel';
import { SearchViewModel, SearchRequest, SearchRoutingState } from '../Search/SearchViewModel';
import { ObjectComparer } from '../../../Utils/Compare';
import { PagerViewModel } from '../Pager/PagerViewModel';

export interface ItemListPanelRequestContext {
  search?: SearchRequest;
}

export type ItemListPanelContext<TRequestContext> = ItemListPanelRequestContext & TRequestContext;

export interface ItemListPanelRoutingState extends DataGridRoutingState {
  search?: SearchRoutingState;
}

export class ItemListPanelViewModel<T, TRequestContext = any> extends DataGridViewModel<T, ItemListPanelContext<TRequestContext>> implements RoutingStateHandler<ItemListPanelRoutingState> {
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
    if (search == null) {
      return Observable.of({});
    }

    return this.wx
      .whenAny(search.requests, x => x)
      .filterNull()
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
   * @param source data source.
   * @param filterer filter predicate. executed for each item when the search context is available.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param pager pager. if omitted a default pager will be created. use null for no pager.
   * @param context request context included in projection requests. if included requests are bound to context events.
   * @param comparer custom object comparer. if omitted a default object comparer will be used.
   */
  constructor(
    source: ObservableLike<IterableLike<T>>,
    filterer?: (item: T, search: SearchRequest) => boolean,
    search?: SearchViewModel | null,
    pager?: PagerViewModel | null,
    context?: ObservableLike<TRequestContext>,
    comparer?: string | ObjectComparer<T>,
    rateLimit?: number,
  ) {
    // create the effective search view model (or null if omitted)
    search = ItemListPanelViewModel.getItemListPanelSearch(search);

    // initialize the data grid with a composite context observable
    super(source, pager, ItemListPanelViewModel.getDataGridContext(search, context), comparer, rateLimit);

    this.filterer = filterer;
    this.search = search;

    if (this.search != null) {
      // seed the search after routing state is loaded
      // we need to do this because we want an initial request even if the filter is empty
      this.processRequests.results
        .take(1)
        .invokeCommand(this.search.search);
    }
  }

  isRoutingStateHandler() {
    return true;
  }

  createRoutingState(changed?: HandlerRoutingStateChanged): ItemListPanelRoutingState {
    return Object.trim(
      Object.assign(
        super.createRoutingState(changed),
        {
          search: this.getRoutingStateValue(this.search, x => x.createRoutingState(changed)),
        },
      ),
    );
  }

  applyRoutingState(state: ItemListPanelRoutingState) {
    if (this.search != null) {
      this.search.applyRoutingState(state.search || {});
    }

    // we apply the base (grid) routing state last because it will trigger requests to start
    super.applyRoutingState(state);
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
