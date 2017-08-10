import * as clone from 'clone';

import { wx, IterableLike, ObservableLike } from '../../../WebRx';
import { BaseItemListPanelViewModel } from './BaseItemListPanelViewModel';
import { DataGridViewModel, ProjectionRequest, ProjectionResult } from '../DataGrid/DataGridViewModel';
import { ObjectComparer } from '../../../Utils/Compare';

export class ItemListPanelViewModel<TData, TItem> extends BaseItemListPanelViewModel<TData, TItem, ProjectionRequest, ProjectionResult<TItem>, DataGridViewModel<TData, TItem>> {
  public static displayName = 'ItemListPanelViewModel';

  constructor(
    data: ObservableLike<IterableLike<TData>>,
    listItemSelector: (item: TData) => TItem,
    filterer?: (item: TItem, regex: RegExp) => boolean,
    comparer?: string | ObjectComparer<TItem>,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    super(
      new DataGridViewModel(
        data,
        listItemSelector,
        filterer,
        comparer,
        isMultiSelectEnabled,
        isLoading,
        pagerLimit,
        rateLimit,
        isRoutingEnabled,
      ),
      isRoutingEnabled,
    );
  }
}

export class SimpleItemListPanelViewModel<TData> extends ItemListPanelViewModel<TData, TData> {
  public static displayName = 'SimpleItemListPanelViewModel';

  constructor(
    data: ObservableLike<IterableLike<TData>>,
    filterer?: (item: TData, regex: RegExp) => boolean,
    comparer?: string | ObjectComparer<TData>,
    isMultiSelectEnabled?: boolean,
    isLoading?: ObservableLike<boolean>,
    pagerLimit?: number,
    rateLimit?: number,
    isRoutingEnabled?: boolean,
  ) {
    super(
      data,
      x => clone(x),
      filterer,
      comparer,
      isMultiSelectEnabled,
      isLoading,
      pagerLimit,
      rateLimit,
      isRoutingEnabled,
    );
  }
}
