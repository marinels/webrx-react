import { Observable } from 'rx';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

export interface AsyncDataSource<TData> {
  getCount(filter: string): Observable<number>;
  getResults(filter: string, offset: number, limit: number, sortField?: string, sortDirection?: SortDirection): Observable<TData[]>;
}

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    private dataSource: AsyncDataSource<TData>,
    protected enableFilter = false,
    protected enableSort = false,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(null, null, null, isMultiSelectEnabled, rateLimit, isRoutingEnabled);
  }

  canFilter() {
    return this.enableFilter;
  }

  canSort() {
    return this.enableSort;
  }

  projectItems() {
    this.dataSource
      .getCount(this.search.filter() || '')
      .subscribe(x => {
        this.pager.itemCount(x);
      });

    return this.dataSource
      .getResults(this.search.filter() || '', this.pager.offset() || 0, this.pager.limit() || 0, this.sortField(), this.sortDirection());
  }
}
