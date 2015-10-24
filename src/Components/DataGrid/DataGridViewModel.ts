'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from '../React/BaseViewModel';

export enum SortDirection {
  Ascending,
  Descending
}

export interface IDataGridComparer<TData> {
  (a: TData, b: TData, fieldName: string, direction: SortDirection): number;
}

export interface IDataGridViewModel extends IBaseViewModel {
  isSortedBy(fieldName: string, direction: SortDirection): boolean;
  sortBy(fieldName: string, direction: SortDirection): void;
  getItems(): any[];
}

export class DataGridViewModel<TData> extends BaseViewModel implements IDataGridViewModel {
  constructor(initialContents?: TData[]) {
    super();

    this.items = wx.list<TData>(initialContents);
  }

  public items: wx.IObservableList<TData>;
  public sortField = wx.property<string>();
  public sortDirection = wx.property<SortDirection>();

  // private sorter: (fieldName: string, direction: SortDirection) => void;
  // private itemComparer: (a: TData, b: TData, fieldName: string, direction: SortDirection) => number;

  isSortedBy(fieldName: string, direction: SortDirection) {
    return fieldName === this.sortField() && direction === this.sortDirection();
  }

  sortBy(fieldName: string, direction: SortDirection) {
    this.sortField(fieldName);
    this.sortDirection(direction);
  }

  getItems() {
    return this.items.toArray();
  }
}

export default DataGridViewModel;
