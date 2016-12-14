import * as wx from 'webrx';
import { Observable } from 'rx';

import { ObjectComparer, SortDirection } from '../../../Utils/Compare';
import { ListViewModel } from '../List/ListViewModel';
import { SearchViewModel, SearchRoutingState } from '../Search/SearchViewModel';
import { PagerViewModel, PagerRoutingState } from '../Pager/PagerViewModel';

export interface SortArgs {
  field: string;
  direction: SortDirection;
}

export interface DataGridRoutingState {
  search: SearchRoutingState;
  sortBy: string;
  sortDir: SortDirection;
  pager: PagerRoutingState;
}

export class DataGridViewModel<TData> extends ListViewModel<TData, DataGridRoutingState> {
  public static displayName = 'DataGridViewModel';

  public static create<TData>(...items: TData[]) {
    return new DataGridViewModel(wx.property<TData[]>(items));
  }

  public search: SearchViewModel;
  public pager: PagerViewModel;

  public projectedItems: wx.IObservableReadOnlyProperty<TData[]>;
  public sortField: wx.IObservableReadOnlyProperty<string>;
  public sortDirection: wx.IObservableReadOnlyProperty<SortDirection>;
  public isLoading: wx.IObservableReadOnlyProperty<boolean>;

  public sort: wx.ICommand<SortArgs>;
  public toggleSortDirection: wx.ICommand<string>;
  public refresh: wx.ICommand<any>;

  constructor(
    items?: wx.ObservableOrProperty<TData[]>,
    protected filterer?: (item: TData, regex: RegExp) => boolean,
    protected comparer = new ObjectComparer<TData>(),
    isMultiSelectEnabled?: boolean,
    isLoading?: wx.ObservableOrProperty<boolean>,
    pagerLimit?: number,
    rateLimit = 100,
    isRoutingEnabled?: boolean
  ) {
    super(items, isMultiSelectEnabled, isRoutingEnabled);

    if (wx.isProperty(isLoading) === true) {
      this.isLoading = <wx.IObservableReadOnlyProperty<boolean>>isLoading;
    }
    else if (Observable.isObservable(isLoading) === true) {
      this.isLoading = (<Observable<boolean>>isLoading).toProperty(true);
    }
    else {
      this.isLoading = Observable.of(false).toProperty();
    }

    this.search = new SearchViewModel(true, undefined, undefined, this.isRoutingEnabled);
    this.pager = new PagerViewModel(pagerLimit, this.isRoutingEnabled);

    this.sort = wx.asyncCommand((x: SortArgs) => Observable.of(x));
    this.toggleSortDirection = wx.asyncCommand((x: string) => Observable.of(x));
    this.refresh = wx.command();

    const sortChanged = wx
      .whenAny(this.sort.results, x => x);

    this.sortField = sortChanged
      .map(x => x == null ? null : x.field)
      .toProperty();

    this.sortDirection = sortChanged
      .map(x => x == null ? null : x.direction)
      .toProperty();

    this.projectedItems = wx
      .whenAny(
        this.pager.offset,
        this.pager.limit,
        this.sortField,
        this.sortDirection,
        this.items,
        this.search.results,
        this.refresh.results,
        () => null
      )
      .debounce(rateLimit)
      .flatMap(x => this.getProjectedItems())
      .toProperty();

    this.subscribe(
      this.toggleSortDirection.results
        .map(x => (<SortArgs>{
          field: x || this.sortField(),
          direction: (x === this.sortField()) ?
            (this.sortDirection() === SortDirection.Descending ? SortDirection.Ascending : SortDirection.Descending) :
            SortDirection.Ascending,
        }))
        .invokeCommand(x => this.sort)
    );

    this.subscribe(wx
      .whenAny(this.items, x => (x || []).length)
      .subscribe(x => {
        this.pager.itemCount(x);
      })
    );

    this.refresh.execute(null);
  }

  protected getProjectedItems() {
    return Observable
      .defer(() => this.projectItems())
      .catch(e => {
        this.alertForError(e, 'Error Projecting Data');

        return Observable.empty<TData[]>();
      });
  }

  protected projectItems() {
    let items = this.items();
    const regex = this.search.regex();

    if (this.filterer != null && regex != null) {
      items = items.filter(x => this.filterer(x, regex));
    }

    this.pager.itemCount(items.length);

    if (this.comparer != null && String.isNullOrEmpty(this.sortField()) === false && this.sortDirection() != null) {
      items = items.sort((a, b) => {
        return this.comparer.compare(a, b, this.sortField(), this.sortDirection());
      });
    }

    const offset = this.pager.offset() || 0;

    if (offset > 0 || (this.pager.limit() || 0) > 0) {
      const end = this.pager.limit() == null ? items.length : offset + this.pager.limit();

      items = items.slice(offset, end);
    }

    return Observable
      .of(items);
  }

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

    this.sortField(state.sortBy);
    this.sortDirection(state.sortDir);
  }
}
