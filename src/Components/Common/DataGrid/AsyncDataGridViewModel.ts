'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

export interface IAsyncDataSource<TData> {
  getCount(filter: string): Rx.Observable<number>;
  getResults(filter: string, offset: number, limit: number, sortField?: string, sortDirection?: SortDirection): Rx.Observable<TData[]>;
}

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    private dataSource: IAsyncDataSource<TData>,
    enableRouting = false) {
    super(null, null, enableRouting);
  }

  projectItems() {
    this.dataSource.getCount(this.search.filter() || '').invokeCommand(this.pager.updateItemCount);

    return this.dataSource.getResults(this.search.filter() || '', this.pager.offset() || 0, this.pager.limit() || 0, this.sortField(), this.sortDirection());
  }
}

export default AsyncDataGridViewModel;
