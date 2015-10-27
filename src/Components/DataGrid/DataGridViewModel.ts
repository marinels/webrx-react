'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import SearchViewModel from '../Search/SearchViewModel';
import PagerViewModel from '../Pager/PagerViewModel';

export enum SortDirection {
  Ascending,
  Descending
}

export class DataGridViewModel<TData> extends BaseViewModel {
  constructor(
    protected filterer?: (item: TData, filter: string) => boolean,
    protected comparer?: (sortField: string, sortDirection: SortDirection, a: TData, b: TData) => number,
    ...items: TData[]) {
    super();

    this.items.addRange(items);
  }

  public items = wx.list<TData>();
  public projectedItems = wx.list<TData>();
  public filter = wx.property('');
  public offset = wx.property<number>();
  public limit = wx.property<number>();
  public sortField = wx.property<string>();
  public sortDirection = wx.property<SortDirection>();
  public search = new SearchViewModel();
  public pager = new PagerViewModel();

  private filteredItems: TData[];

  public initialize() {
    super.initialize();

    this.subscribe(wx.whenAny(
      this.offset,
      this.limit,
      this.sortField,
      this.sortDirection,
      () => null)
      .skip(1)
      .debounce(100)
      .subscribe(x => {
        this.projectItems();
      }));

    this.subscribe(this.pager.selectedPage.changed
      .subscribe(x => {
        this.offset(this.limit() == null ? 0 : (x - 1) * this.limit());
      }));

    this.subscribe(Rx.Observable.combineLatest(
      this.items.listChanged,
      this.filter.changed,
      () => null)
      .debounce(100)
      .startWith(null) // initial fetch
      .subscribe(x => {
        this.filterItems();
      }));
  }

  protected updateCount(count: number) {
    this.pager.pageCount(Math.ceil(count / this.limit()));
    this.pager.selectedPage(1);
  }

  protected updateItems(items: TData[]) {
    let disp = this.projectedItems.suppressChangeNotifications();
    this.projectedItems.clear();
    this.projectedItems.addRange(items);
    disp.dispose();
  }

  protected filterItems() {
    let items = this.items.toArray();

    if (this.filterer != null && String.isNullOrEmpty(this.filter()) === false) {
      items = items.filter(x => this.filterer(x, this.filter()));
    }

    this.filteredItems = items;

    if (this.limit() == null) {
      this.projectItems();
    } else {
      this.updateCount(items.length);
    }
  }

  protected projectItems() {
    let items = this.filteredItems;

    if (this.comparer != null && this.sortField() != null && this.sortDirection() != null) {
      items = items.sort((a, b) => this.comparer(this.sortField(), this.sortDirection(), a, b));
    }

    if (this.offset() > 0 || this.limit() != null) {
      let end = this.limit() == null ? items.length : this.offset() + this.limit();
      items = items.slice(this.offset(), end);
    }

    this.updateItems(items);
  }

  canFilter() {
    return this.filterer != null;
  }

  canSort() {
    return this.comparer != null;
  }

  isSortedBy(fieldName: string, direction: SortDirection) {
    return fieldName === this.sortField() && direction === this.sortDirection();
  }

  sortBy(fieldName: string, direction: SortDirection) {
    this.sortField(fieldName);
    this.sortDirection(direction);
  }
}

export default DataGridViewModel;
