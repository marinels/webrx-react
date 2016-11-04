import { Observable } from 'rx';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

export interface AsyncDataRequest {
  filter: string;
  offset: number;
  limit: number;
  sortField?: string;
  sortDirection?: SortDirection;
}

export interface AsyncDataResult<TData> {
  data: TData[];
  count: number;
}

export interface AsyncDataSource<TData> {
  getResultAsync(request: AsyncDataRequest): Observable<AsyncDataResult<TData>>;
}

export class AsyncDataGridViewModel<TData> extends DataGridViewModel<TData> {
  public static displayName = 'AsyncDataGridViewModel';

  constructor(
    protected dataSource: AsyncDataSource<TData>,
    protected enableFilter = false,
    protected enableSort = false,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(undefined, undefined, undefined, isMultiSelectEnabled, rateLimit, isRoutingEnabled);
  }

  canFilter() {
    return this.enableFilter;
  }

  canSort() {
    return this.enableSort;
  }

  projectItems() {
    return this.dataSource
      .getResultAsync(this.getRequestParams())
      .doOnNext(x => {
        this.pager.itemCount(x.count);
      })
      .doOnError(e => {
        this.alertForError(e, 'Async DataSource Error');
      })
      .map(x => x.data);
  }

  protected getRequestParams(
    filter = this.search.filter() || '',
    offset = this.pager.offset() || 0,
    limit = this.pager.limit() || 0,
    sortField = this.sortField(),
    sortDirection = this.sortDirection()
  ) {
    return <AsyncDataRequest>{
      filter,
      offset,
      limit,
      sortField,
      sortDirection,
    };
  }
}
