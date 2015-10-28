'use strict';

import * as wx from 'webrx';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';
import { SearchViewModel, ISearchRoutingState } from '../Search/SearchViewModel';
import { PagerViewModel, IPagerRoutingState } from '../Pager/PagerViewModel';

export enum SortDirection {
  Ascending,
  Descending
}

export interface IDataGridRoutingState {
  search: ISearchRoutingState;
  sortBy: string;
  sortDir: SortDirection;
  pager: IPagerRoutingState;
}

export class DataGridViewModel<TData> extends BaseRoutableViewModel<IDataGridRoutingState> {
  constructor(
    protected filterer?: (item: TData, filter: string) => boolean,
    protected comparer?: (sortField: string, sortDirection: SortDirection, a: TData, b: TData) => number,
    isRoutingEnabled = false,
    ...items: TData[]) {
    super(isRoutingEnabled);

    this.items.addRange(items);
  }

  public items = wx.list<TData>();
  public projectedItems = wx.list<TData>();
  public sortField = wx.property<string>();
  public sortDirection = wx.property<SortDirection>();
  public search = new SearchViewModel(this.isRoutingEnabled);
  public pager = new PagerViewModel(null, this.isRoutingEnabled);

  private filteredItems: TData[];

  initialize() {
    super.initialize();

    this.subscribe(wx.whenAny(
      this.pager.offset,
      this.pager.limit,
      this.sortField,
      this.sortDirection,
      () => null)
      .skip(1)
      .debounce(100)
      .subscribe(x => {
        this.projectItems();
      }));

    this.subscribe(Rx.Observable.combineLatest(
      this.items.listChanged.startWith(true),
      this.search.filter.changed.debounce(500).startWith(''),
      () => null)
      .debounce(100)
      .subscribe(x => {
        this.filterItems();
        this.routingStateChanged();
      }));
  }

  getRoutingState() {
    return this.createRoutingState(state => {
      state.search = this.search.getRoutingState();

      if (this.sortField() != null) {
        state.sortBy = this.sortField();
      }

      if (this.sortDirection() != null) {
        state.sortDir = this.sortDirection();
      }

      state.pager = this.pager.getRoutingState();
    });
  }

  setRoutingState(state = {} as IDataGridRoutingState) {
    if (this.isRoutingEnabled) {
      this.search.setRoutingState(state.search);

      this.pager.setRoutingState(state.pager);
    }
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

    if (this.pager.limit() == null) {
      this.projectItems();
    } else {
      this.pager.itemCount(items.length);
    }
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

  public sortBy(fieldName: string, direction: SortDirection) {
    this.sortField(fieldName);
    this.sortDirection(direction);
  }
}

export default DataGridViewModel;
