import { wx, ObservableLike } from '../../../WebRx';
import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { DataGridViewModel, ProjectionRequest, ProjectionResult } from '../DataGrid/DataGridViewModel';
import { ObjectComparer } from '../../../Utils/Compare';

export class ItemListPanelViewModel<TData> extends BaseItemListPanelViewModel<TData, ProjectionRequest, ProjectionResult<TData>, DataGridViewModel<TData>> {
  public static displayName = 'ItemListPanelViewModel';

  public static create<T>(...items: T[]) {
    return new ItemListPanelViewModel(wx.property(items, false));
  }

  constructor(
    items?: ObservableLike<TData[]>,
    filterer?: (item: TData, regex: RegExp) => boolean,
    comparer?: string | ObjectComparer<TData>,
    preFilter?: (items: TData[]) => TData[],
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    super(
      new DataGridViewModel<TData>(items, filterer, comparer, preFilter, isMultiSelectEnabled, isLoading, pagerLimit, rateLimit, isRoutingEnabled),
      isRoutingEnabled,
    );
  }
}
