'use strict';

import * as wx from 'webrx';

import { ListViewModel, IListRoutingState } from '../List/ListViewModel';
import { SearchViewModel, ISearchRoutingState } from '../Search/SearchViewModel';
import { PagerViewModel, IPagerRoutingState } from '../Pager/PagerViewModel';

export enum SortDirection {
  Ascending,
  Descending
}

export interface IDataGridRoutingState extends IListRoutingState {
  search: ISearchRoutingState;
  sortBy: string;
  sortDir: SortDirection;
  pager: IPagerRoutingState;
}

export class DataGridViewModel<TData> extends ListViewModel<TData, IDataGridRoutingState> {
  public static displayName = 'DataGridViewModel';

  constructor(
    protected filterer?: (item: TData, filter: string) => boolean,
    protected comparer?: (sortField: string, sortDirection: SortDirection, a: TData, b: TData) => number,
    isRoutingEnabled = false,
    ...items: TData[]) {
    super(isRoutingEnabled, ...items);
  }

  protected filter = wx.command();
  protected project = wx.command();

  public projectedItems = wx.list<TData>();
  public search = new SearchViewModel(true, undefined, this.isRoutingEnabled);
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

  private filteredItems: TData[];

  initialize() {
    super.initialize();
    
    this.subscribe(this.toggleSortDirection.results
      .invokeCommand(() => this.sortDirection() === SortDirection.Ascending ? this.sortDescending : this.sortAscending)
    );
    
    this.subscribe(wx.whenAny(
      this.pager.offset,
      this.pager.limit,
      this.sortField,
      this.sortDirection,
      () => null)
      .skip(1)
      .invokeCommand(this.project));

    this.subscribe(Rx.Observable.combineLatest(
      this.items.listChanged.startWith(true),
      this.search.search.results.startWith(null),
      () => null)
      .skip(1)
      .invokeCommand(this.filter));

    this.filter.results
      .debounce(100)
      .subscribe(x => {
        this.filterItems();
      });

    this.project.results
      .debounce(100)
      .subscribe(x => {
        this.projectItems();
      });

    this.filter.execute(null);
  }

  protected updateItems(items: TData[]) {
    let disp = this.projectedItems.suppressChangeNotifications();
    this.projectedItems.clear();
    this.projectedItems.addRange(items);
    disp.dispose();
  }

  protected filterItems() {
    let items = this.items.toArray();

    if (this.filterer != null && String.isNullOrEmpty(this.search.filter()) === false) {
      items = items.filter(x => this.filterer(x, this.search.filter()));
    }

    this.filteredItems = items;

    this.pager.itemCount(items.length);
    this.project.execute(null);
  }

  protected projectItems() {
    let items = this.filteredItems;

    if (this.comparer != null && this.sortField() != null && this.sortDirection() != null) {
      items = items.sort((a, b) => this.comparer(this.sortField(), this.sortDirection(), a, b));
    }

    if (this.pager.offset() > 0 || this.pager.limit() != null) {
      let end = this.pager.limit() == null ? items.length : this.pager.offset() + this.pager.limit();
      items = items.slice(this.pager.offset(), end);
    }

    this.updateItems(items);
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

  getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      state.search = this.search.getRoutingState(context);

      if (this.sortField() != null) {
        state.sortBy = this.sortField();
      }

      if (this.sortDirection() != null) {
        state.sortDir = this.sortDirection();
      }

      state.pager = this.pager.getRoutingState();
    });
  }

  setRoutingState(state: IDataGridRoutingState) {
    this.handleRoutingState(state, state => {
      this.search.setRoutingState(state.search);
      this.pager.setRoutingState(state.pager);
    });
  }
}

export default DataGridViewModel;
