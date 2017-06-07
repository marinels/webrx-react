import { Observable } from 'rxjs';

import { ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { BaseDataGridViewModel, ProjectionRequest, ProjectionResult } from '../DataGrid/DataGridViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';

export abstract class BaseItemListPanelViewModel<TData, TRequest extends ProjectionRequest, TResult extends ProjectionResult<TData>, TGrid extends BaseDataGridViewModel<TData, TRequest, TResult>> extends BaseRoutableViewModel<any> {
  public static displayName = 'BaseItemListPanelViewModel';

  constructor(
    public readonly grid: TGrid,
    isRoutingEnabled?: boolean,
  ) {
    super(isRoutingEnabled);
  }

  public get isLoading() {
    return this.grid.isLoading;
  }

  public get items() {
    return this.grid.items;
  }

  public get projectedItems() {
    return this.grid.projectedItems;
  }

  public get lengthChanged() {
    return this
      .whenAny(this.items, x => (x || []).length)
      .distinctUntilChanged();
  }

  public get selectedItem() {
    return this.grid.selectedItem;
  }

  public get selectItem() {
    return this.grid.selectItem;
  }

  getSearch() {
    return this.grid.getSearch();
  }
}
