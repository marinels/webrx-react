import * as wx from 'webrx';

import { ObjectComparer, SortDirection } from '../../../Utils/Compare';
import { ListViewModel, IListRoutingState } from '../List/ListViewModel';
import { SearchViewModel, ISearchRoutingState } from '../Search/SearchViewModel';
import { PagerViewModel, IPagerRoutingState } from '../Pager/PagerViewModel';

export interface DataGridRoutingState extends IListRoutingState {
  search: ISearchRoutingState;
  sortBy: string;
  sortDir: SortDirection;
  pager: IPagerRoutingState;
}

export class DataGridViewModel<TData> extends ListViewModel<TData, DataGridRoutingState> {
  public static displayName = 'DataGridViewModel';

  public projectedItems = wx.list<TData>();

  protected project = wx.command();

  public search = new SearchViewModel(true, undefined, undefined, this.isRoutingEnabled);
  public pager = new PagerViewModel(null, this.isRoutingEnabled);

  public sortAscending = wx.command();
  public sortDescending = wx.command();
  public toggleSortDirection = wx.command();

  public sortField = Rx.Observable
    .merge(
      this.sortAscending.results,
      this.sortDescending.results)
    .select(x => x as string)
    .toProperty();

  public sortDirection = Rx.Observable
    .merge(
      this.sortAscending.results
        .select(x => SortDirection.Ascending),
      this.sortDescending.results
        .select(x => SortDirection.Descending)
    )
    .toProperty();

  constructor(
    protected filterer?: (item: TData, regex: RegExp) => boolean,
    protected comparer = new ObjectComparer<TData>(),
    isMultiSelectEnabled?: boolean,
    isRoutingEnabled?: boolean,
    ...items: TData[]) {
    super(isMultiSelectEnabled, isRoutingEnabled, ...items);

    this.subscribe(
      this.project.results
        .debounce(100)
        .selectMany(x => this.projectItems())
        .subscribe(x => {
          wx.using(this.projectedItems.suppressChangeNotifications(), disp => {
            this.projectedItems.clear();
            this.projectedItems.addRange(x);
          });
        })
    );

    this.subscribe(this.toggleSortDirection.results
      .invokeCommand(x => {
        let sortDirection = this.sortDirection();

        if (x != null && x !== this.sortField()) {
          sortDirection = null;
        }

        return sortDirection === SortDirection.Descending ? this.sortAscending : this.sortDescending;
      })
    );

    this.subscribe(
      wx.whenAny(
        this.pager.offset,
        this.pager.limit,
        this.sortField,
        this.sortDirection,
        this.items.listChanged.startWith(false),
        this.search.results.startWith(null),
        () => null)
      .invokeCommand(this.project)
    );

    this.subscribe(wx
      .whenAny(
        this.items.length,
        x => x)
      .invokeCommand(this.pager.updateItemCount)
    );
  }

  protected projectItems() {
    let items = this.items.toArray();
    let regex = this.search.regex();

    if (this.filterer != null && regex != null) {
      items = items.filter(x => this.filterer(x, regex));
    }

    this.pager.updateItemCount.execute(items.length);

    if (this.comparer != null && this.sortField() != null && this.sortDirection() != null) {
      items = items.sort((a, b) => this.comparer.compare(a, b, this.sortField(), this.sortDirection()));
    }

    let offset = this.pager.offset() || 0;
    if (offset > 0 || this.pager.limit() != null) {
      let end = this.pager.limit() == null ? items.length : offset + this.pager.limit();

      items = items.slice(offset, end);
    }

    return Rx.Observable.return(items);
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

    if (this.sortField() != null) {
      state.sortBy = this.sortField();
    }

    if (this.sortDirection() != null) {
      state.sortDir = this.sortDirection();
    }

    state.pager = this.pager.getRoutingState();
  }

  loadRoutingState(state: DataGridRoutingState) {
    this.search.setRoutingState(state.search);
    this.pager.setRoutingState(state.pager);
  }
}
