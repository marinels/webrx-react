'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import { DataGridViewModel, SortDirection } from './DataGridViewModel';

export interface IAsyncDataSource<TData> {
  getCount(filter: string): Rx.Observable<number>;
  getResults(filter: string, offset: number, limit: number, sortField?: string, sortDirection?: SortDirection): Rx.Observable<TData[]>;
}

const DefaultLimit = 1;

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  constructor(private dataSource: IAsyncDataSource<TData>, canFilter = true, limit = DefaultLimit) {
    super();

    if (canFilter) {
      this.filterer = () => true;
    }
    
    this.limit(limit || DefaultLimit);
  }

  filterItems() {
    this.dataSource.getCount(this.filter())
      .subscribe(x => {
        this.updateCount(x);
      })
  }

  projectItems() {
    this.dataSource.getResults(this.filter(), this.offset() || 0, this.limit() || DefaultLimit, this.sortField(), this.sortDirection())
      .subscribe(x => {
        this.updateItems(x);
      });
  }
}

export default AsyncDataGridViewModel;
