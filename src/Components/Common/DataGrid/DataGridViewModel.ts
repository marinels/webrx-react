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

  public search: SearchViewModel;
  public pager: PagerViewModel;

  public projectedItems: wx.IObservableReadOnlyProperty<TData[]>;
  public sortField: wx.IObservableReadOnlyProperty<string>;
  public sortDirection: wx.IObservableReadOnlyProperty<SortDirection>;

  public sort: wx.ICommand<SortArgs>;
  public toggleSortDirection: wx.ICommand<string>;

  public static create<TData>(...items: TData[]) {
    return new DataGridViewModel(wx.property<TData[]>(items));
  }

  constructor(
    public items: wx.IObservableProperty<TData[]> = wx.property<TData[]>(),
    protected filterer?: (item: TData, regex: RegExp) => boolean,
    protected comparer = new ObjectComparer<TData>(),
    isMultiSelectEnabled?: boolean,
    rateLimit = 100,
    isRoutingEnabled?: boolean
  ) {
    super(items, isMultiSelectEnabled, isRoutingEnabled);

    this.search = new SearchViewModel(true, undefined, undefined, this.isRoutingEnabled);
    this.pager = new PagerViewModel(undefined, this.isRoutingEnabled);

    this.sort = wx.asyncCommand((x: SortArgs) => Observable.of(x));
    this.toggleSortDirection = wx.asyncCommand((x: string) => Observable.of(x));

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
        this.items.changed.startWith([]),
        this.search.results.startWith(null),
        () => null
      )
      .debounce(rateLimit)
      .flatMap(x => this.projectItems())
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

    if (offset > 0 || this.pager.limit() != null) {
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
