import { Observable } from 'rx';
import * as wx from 'webrx';

import { ObjectComparer, SortDirection } from '../../../Utils/Compare';
import { ListViewModel } from '../List/ListViewModel';
import { SearchViewModel, SearchRoutingState } from '../Search/SearchViewModel';
import { PagerViewModel, PagerRoutingState } from '../Pager/PagerViewModel';

export interface SortArgs {
  field: string;
  direction: SortDirection;
}

export interface ProjectionRequest {
  filter?: string;
  regex?: RegExp;
  offset?: number;
  limit?: number;
  sortField?: string;
  sortDirection?: SortDirection;
}

export interface ProjectionResult<TData> {
  items: TData[];
  count: number;
}

export interface DataGridRoutingState {
  search: SearchRoutingState;
  sortBy: string;
  sortDir: SortDirection;
  pager: PagerRoutingState;
}

export abstract class BaseDataGridViewModel<TData, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TData>> extends ListViewModel<TData, DataGridRoutingState> {
  public static displayName = 'BaseDataGridViewModel';

  public search: SearchViewModel;
  public pager: PagerViewModel;

  public projectionRequests: wx.IObservableReadOnlyProperty<TRequest>;
  public projectionResults: wx.IObservableReadOnlyProperty<TResult>;
  public projectedItems: wx.IObservableReadOnlyProperty<TData[]>;
  public sortField: wx.IObservableReadOnlyProperty<string>;
  public sortDirection: wx.IObservableReadOnlyProperty<SortDirection>;
  public isLoading: wx.IObservableReadOnlyProperty<boolean>;
  public hasProjectionError: wx.IObservableProperty<boolean>;

  public sort: wx.ICommand<SortArgs>;
  public toggleSortDirection: wx.ICommand<string>;
  public refresh: wx.ICommand<any>;
  protected project: wx.ICommand<TResult>;

  constructor(
    requests: Observable<TRequest>,
    items?: wx.ObservableOrProperty<TData[]>,
    protected filterer?: (item: TData, regex: RegExp) => boolean,
    protected comparer = new ObjectComparer<TData>(),
    isMultiSelectEnabled?: boolean,
    isLoading?: wx.ObservableOrProperty<boolean>,
    pagerLimit?: number,
    rateLimit = 100,
    isRoutingEnabled?: boolean,
  ) {
    super(items, isMultiSelectEnabled, isRoutingEnabled);

    this.search = new SearchViewModel(undefined, undefined, this.isRoutingEnabled);
    this.pager = new PagerViewModel(pagerLimit, this.isRoutingEnabled);

    this.hasProjectionError = wx.property(false);

    this.sort = wx.asyncCommand((x: SortArgs) => Observable.of(x));
    this.toggleSortDirection = wx.asyncCommand((x: string) => Observable.of(x));
    this.refresh = wx.command();

    const sortChanged = wx
      .whenAny(this.sort.results, x => x);

    this.sortField = Observable
      .merge(
        this.routingState.changed.map(x => x.sortBy),
        sortChanged.map(x => x.field),
      )
      .map(x => x || null)
      .toProperty();

    this.sortDirection = Observable
      .merge(
        this.routingState.changed.map(x => x.sortDir),
        sortChanged.map(x => x.direction),
      )
      .map(x => x || null)
      .toProperty();

    this.projectionRequests = wx
      .whenAny(
        // merge our input requests with our projection requests
        this.getObservableOrAlert(
          () => wx
            .whenAny(this.getProjectionRequests(), requests, (pr, r) => ({ pr, r }))
            .filter(x => x.pr != null)
            .map(x => Object.assign<TRequest>({}, x.pr, x.r)),
          'Error Creating Data Grid Requests',
        ),
        // whenever a discrete refresh request is made we need to re-project
        this.refresh.results.startWith(null),
        // we only care about the requests object from here on out
        x => x,
      )
      // filter out null request data
      .filter(x => x != null)
      .toProperty();

    this.project = wx.asyncCommand((x: TRequest) => {
      return this
        .getObservableOrAlert(
          () => this.getProjectionResult(x)
            .doOnNext(() => {
              // reset our projection error flag since we received a valid result
              this.hasProjectionError(false);
            })
            .catch((e) => {
              // set the projection error flag
              this.hasProjectionError(true);

              return Observable.empty<TResult>();
            }),
          'Error Projecting Data Grid Results',
        )
        // this ensures that errors still generate a result
        .defaultIfEmpty(null);
    });

    this.projectionResults = wx
      .whenAny(this.project.results, x => x)
      // we will get null projection results back if there is an error
      // so just filter these results out of our results observable
      .filter(x => x != null)
      .toProperty();

    if (wx.isProperty(isLoading) === true) {
      this.isLoading = <wx.IObservableReadOnlyProperty<boolean>>isLoading;
    }
    else if (Observable.isObservable(isLoading) === true) {
      this.isLoading = (<Observable<boolean>>isLoading).toProperty(true);
    }
    else {
      // setup a default isLoading observable
      this.isLoading = Observable
        .merge(
          this.project.isExecuting.filter(x => x === true),
          this.project.results.map(() => false),
        )
        .toProperty(true);
    }

    this.projectedItems = wx
      .whenAny(this.project.results, x => x)
      .do(x => {
        // update global pager state
        this.pager.itemCount(x.count);
      })
      // project back down into the item array
      .map(x => x.items)
      .toProperty();

    // whenever there is a new request we re-project
    this.subscribe(wx
      .whenAny(this.projectionRequests, x => x)
      // ignore the (first) null requests
      .filter(x => x != null)
      // debounce on input projection requests
      .debounce(rateLimit)
      .invokeCommand(this.project),
    );

    this.subscribe(
      this.toggleSortDirection.results
        .map(x => (<SortArgs>{
          field: x || this.sortField(),
          direction: (x === this.sortField()) ?
            (this.sortDirection() === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending) :
            SortDirection.Ascending,
        }))
        .invokeCommand(x => this.sort),
    );
  }

  // create the default projection request structure
  protected getProjectionRequests() {
    return wx
      .whenAny(
        this.search.requests,
        this.pager.offset,
        this.pager.limit,
        this.sortField,
        this.sortDirection,
        (search, offset, limit, sortField, sortDirection) => <ProjectionRequest>{
          filter: search == null ? null : search.filter,
          regex: search == null ? null : search.regex,
          search,
          offset,
          limit,
          sortField,
          sortDirection,
        },
      );
  }

  protected abstract getProjectionResult(request: TRequest): Observable<TResult>;

  public canFilter() {
    return this.filterer != null;
  }

  public canSort() {
    return this.comparer != null;
  }

  public isSortedBy(fieldName: string, direction: SortDirection) {
    return fieldName === this.sortField() && direction === this.sortDirection();
  }

  getSearch() {
    return this.canFilter() ? this.search : null;
  }

  saveRoutingState(state: DataGridRoutingState) {
    state.search = this.search.getRoutingState();
    state.pager = this.pager.getRoutingState();

    if (this.sortField() != null) {
      state.sortBy = this.sortField();
    }

    if (this.sortDirection() != null) {
      state.sortDir = this.sortDirection();
    }
  }

  loadRoutingState(state: DataGridRoutingState) {
    this.search.setRoutingState(state.search);
    this.pager.setRoutingState(state.pager);
  }
}

interface ItemsProjectionRequest<TData> extends ProjectionRequest {
  items: TData[];
}

export class DataGridViewModel<TData> extends BaseDataGridViewModel<TData, ItemsProjectionRequest<TData>, ProjectionResult<TData>> {
  public static displayName = 'DataGridViewModel';

  public static create<TData>(...items: TData[]) {
    return new DataGridViewModel(wx.property<TData[]>(items));
  }

  private static getItemsRequestObservable<TData>(source: wx.ObservableOrProperty<TData[]>) {
    if (wx.isProperty(source) === true) {
      return wx
        .whenAny(<wx.IObservableProperty<TData[]>>source, x => x)
        .filter(x => x != null)
        .map(items => <ItemsProjectionRequest<TData>>{
          items,
        });
    }
    else {
      return (<Observable<TData[]>>source)
        .map(items => <ItemsProjectionRequest<TData>>{
          items,
        });
    }
  }

  constructor(
    items: wx.ObservableOrProperty<TData[]> = wx.property<TData[]>([]),
    protected filterer?: (item: TData, regex: RegExp) => boolean,
    protected comparer = new ObjectComparer<TData>(),
    isMultiSelectEnabled?: boolean,
    isLoading?: wx.ObservableOrProperty<boolean>,
    pagerLimit?: number,
    rateLimit = 100,
    isRoutingEnabled?: boolean,
  ) {
    super(DataGridViewModel.getItemsRequestObservable(items), items, filterer, comparer, isMultiSelectEnabled, isLoading, pagerLimit, rateLimit, isRoutingEnabled);
  }

  getProjectionResult(request: ItemsProjectionRequest<TData>) {
    let items = request.items || [];

    if (this.filterer != null && request.regex != null) {
      items = items.filter(x => this.filterer(x, request.regex));
    }

    const count = items.length;

    if (this.comparer != null && String.isNullOrEmpty(request.sortField) === false && request.sortDirection != null) {
      items = items.sort((a, b) => {
        return this.comparer.compare(a, b, request.sortField, request.sortDirection);
      });
    }

    const offset = request.offset || 0;
    const limit = request.limit || items.length;

    if (offset > 0 || (request.limit || 0) > 0) {
      items = items.slice(offset || 0, Math.min(items.length, offset + limit));
    }

    return Observable
      .of(<ProjectionResult<TData>>{
        items,
        count,
      });
  }
}
