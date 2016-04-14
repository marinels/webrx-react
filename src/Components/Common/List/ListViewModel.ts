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
      this.selectItem.results.select(x => x as TData),
      this.selectedIndex.changed
        .where(x => x >= 0 && x < this.items.length())
        .select(x => this.items.get(x))
    )
    .toProperty();

  public getSelectedItems() {
    return this.items.filter(x => (x as any as ISelectableItem).isSelected === true);
  }

  initialize() {
    super.initialize();

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

  public reset(...items: TData[]) {
    if (items.length === 0) {
      this.items.reset();
    } else {
      wx.using(this.items.suppressChangeNotifications(), disp => {
        this.items.clear();
        this.items.addRange(items);
      });
    }
  }

  saveRoutingState(state: TRoutingState) {
    if (this.selectedIndex() != null) {
      state.selectedIndex = this.selectedIndex();
    }

    super.saveRoutingState(state);
  }

  loadRoutingState(state: TRoutingState) {
    if (state.selectedIndex != null) {
      this.selectedIndex(state.selectedIndex);
    }

    super.loadRoutingState(state);
  }
}

export default ListViewModel;
