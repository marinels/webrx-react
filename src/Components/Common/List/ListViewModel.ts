'use strict';

import * as wx from 'webrx';

import BaseRoutableViewModel from '../../React/BaseRoutableViewModel';

export interface IListRoutingState {
  selectedIndex: number;
}

export class ListViewModel<TData, TRoutingState extends IListRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  constructor(isRoutingEnabled = false, ...items: TData[]) {
    super(isRoutingEnabled);

    if (items.length > 0) {
      this.items.addRange(items);
    }
  }

  public items = wx.list<TData>();
  public selectIndex = wx.asyncCommand((x: number) => Rx.Observable.return(x));
  public selectItem = wx.asyncCommand((x: TData) => Rx.Observable.return(x));
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = Rx.Observable
    .merge(
      this.selectItem.results,
      this.selectedIndex.changed
        .where(x => x >= 0 && x < this.items.length())
        .select(x => this.items.get(x))
    )
    .toProperty();
  
  getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      if (this.selectedIndex() != null) {
        state.selectedIndex = this.selectedIndex();
      }
    });
  }

  setRoutingState(state: TRoutingState) {
    this.handleRoutingState(state, state => {
      if (state.selectedIndex != null) {
        this.selectedIndex(state.selectedIndex);
      }
    });
  }
}

export default ListViewModel;
