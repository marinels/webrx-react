import { Observable } from 'rx';
import * as wx from 'webrx';

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

export interface AsyncDataSource<TData, TResult extends AsyncDataResult<TData>> {
  getResultAsync(request: AsyncDataRequest): Observable<TResult>;
}

export class AsyncDataGridViewModel<TData, TResult extends AsyncDataResult<TData>> extends DataGridViewModel<TData> {
  public static displayName = 'AsyncDataGridViewModel';

  public asyncResult: wx.IObservableReadOnlyProperty<TResult>;

  public requestData: wx.ICommand<TResult>;

  constructor(
    protected dataSource: AsyncDataSource<TData, TResult>,
    protected enableFilter = false,
    protected enableSort = false,
    isMultiSelectEnabled?: boolean,
    rateLimit?: number,
    isRoutingEnabled?: boolean
  ) {
    super(undefined, undefined, undefined, isMultiSelectEnabled, rateLimit, isRoutingEnabled);

    this.requestData = wx.asyncCommand((x: AsyncDataRequest) => {
      return this.dataSource.getResultAsync(x)
        .catch(e => {
          this.alertForError(e, 'Async DataSource Error');

          return Observable.empty<TResult>();
        });
    });

    this.asyncResult = wx
      .whenAny(this.requestData.results, x => x)
      .doOnNext(x => {
        this.pager.itemCount(x.count);
      })
      .toProperty();
  }

  canFilter() {
    return this.enableFilter;
  }

  canSort() {
    return this.enableSort;
  }

  projectItems() {
    return this.requestData
      .executeAsync(this.getRequestParams())
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
