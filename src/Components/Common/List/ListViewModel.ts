'use strict';

import * as wx from 'webrx';

import BaseRoutableViewModel from '../../React/BaseRoutableViewModel';

export interface IListRoutingState {
  selectedIndex: number;
}

export interface ISelectableItem {
  isSelected: boolean;
}

export class ListViewModel<TData, TRoutingState extends IListRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  constructor(public isMultiSelectEnabled = false, isRoutingEnabled = false, ...items: TData[]) {
    super(isRoutingEnabled);

    if (items.length > 0) {
      this.items.addRange(items);
    }
  }

  public items = wx.list<TData>();
  public selectIndex = wx.command();
  public selectItem = wx.command();
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = Rx.Observable
    .merge(
      this.selectItem.results,
      this.selectedIndex.changed
        .where(x => x >= 0 && x < this.items.length())
        .select(x => this.items.get(x))
    )
    .toProperty();
  
  public getSelectedItems() {
    return this.items.filter(x => (x as any as ISelectableItem).isSelected === true)
  }

  initialize() {
    if (this.isMultiSelectEnabled) {
      this.subscribe(
        Rx.Observable
          .merge(
            this.selectItem.results,
            this.selectIndex.results
              .where(x => x >= 0 && x < this.items.length())
              .select(x => this.items.get(x))
          )
          .subscribe(x => {
            let selectable = x as any as ISelectableItem;
            if (selectable.isSelected != null) {
              selectable.isSelected = !selectable.isSelected;

              // because the isSelected is not necessarily a reactive property
              // we need to force a change notification here
              this.notifyChanged();
            }
          })
      );
    }
  }

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
