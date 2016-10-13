import * as Rx from 'rx';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

export interface AsyncDataSource<TData> {
  getCount(filter: string): Rx.Observable<number>;
  getResults(filter: string, offset: number, limit: number, sortField?: string, sortDirection?: SortDirection): Rx.Observable<TData[]>;
}

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    private dataSource: AsyncDataSource<TData>,
    isMultiSelectEnabled?: boolean,
    isRoutingEnabled?: boolean
  ) {
    super(null, null, null, isMultiSelectEnabled, isRoutingEnabled);
  }

  canFilter() {
    return true;
  }

  canSort() {
    return true;
  }

  projectItems() {
    this.dataSource.getCount(this.search.filter() || '').invokeCommand(this.pager.updateItemCount);

    return this.dataSource.getResults(this.search.filter() || '', this.pager.offset() || 0, this.pager.limit() || 0, this.sortField(), this.sortDirection());
  }
}
