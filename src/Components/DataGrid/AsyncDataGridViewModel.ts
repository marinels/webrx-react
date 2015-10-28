'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import { DataGridViewModel, SortDirection } from './DataGridViewModel';

export interface IAsyncDataSource<TData> {
  getCount(filter: string): Rx.Observable<number>;
  getResults(filter: string, offset: number, limit: number, sortField?: string, sortDirection?: SortDirection): Rx.Observable<TData[]>;
}

export const DefaultLimit = 10;

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  constructor(
    private dataSource: IAsyncDataSource<TData>,
    canFilter = true,
    limit = DefaultLimit,
    enableRouting = false) {
    super(canFilter === true ? () => true : null, null, enableRouting);

    this.pager.limit(limit || DefaultLimit);
  }

  filterItems() {
    this.dataSource.getCount(this.search.filter())
      .subscribe(x => {
        this.pager.itemCount(x);
      })
  }

  projectItems() {
    this.dataSource.getResults(this.search.filter(), this.pager.offset() || 0, this.pager.limit() || DefaultLimit, this.sortField(), this.sortDirection())
      .subscribe(x => {
        this.updateItems(x);
      });
  }
}

export default AsyncDataGridViewModel;
