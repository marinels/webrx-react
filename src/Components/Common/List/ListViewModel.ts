import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface IListRoutingState {
  selectedIndex: number;
}

export interface ISelectableItem {
  isSelected: boolean;
}

export class ListViewModel<TData, TRoutingState extends IListRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  public items = wx.list<TData>();
  public selectIndex = wx.asyncCommand((x: number) => Rx.Observable.return(x));
  public selectItem = wx.asyncCommand((x: TData) => Rx.Observable.return(x));
  public toggleMultiSelectionState = wx.asyncCommand((x: TData) => {
    const selectable = x as any as ISelectableItem;

    if (selectable.isSelected != null) {
      selectable.isSelected = !selectable.isSelected;

      // because the isSelected is not necessarily a reactive property
      // we need to force a change notification here
      this.notifyChanged();
    }

    return Rx.Observable.return(x);
  });
  public selectedIndex = this.selectIndex.results.toProperty();
  public selectedItem = Rx.Observable
    .merge(
      this.selectItem.results.select(x => x as TData),
      this.selectedIndex.changed
        .where(x => x >= 0 && x < this.items.length())
        .select(x => this.items.get(x))
    )
    .do(x => {
      if (this.isMultiSelectEnabled === true) {
        this.toggleMultiSelectionState.execute(x);
      }
    })
    .toProperty();

  public static create<TData>(...items: TData[]) {
    return new ListViewModel(items);
  }

  constructor(
    items: TData[] = [],
    public isMultiSelectEnabled = false,
    isRoutingEnabled?: boolean
  ) {
    super(isRoutingEnabled);

    if (items.length > 0) {
      this.items.addRange(items);
    }
  }

  saveRoutingState(state: TRoutingState) {
    if (this.selectedIndex() != null) {
      state.selectedIndex = this.selectedIndex();
    }
  }

  loadRoutingState(state: TRoutingState) {
    if (state.selectedIndex != null) {
      this.selectedIndex(state.selectedIndex);
    }
  }

  public reset(...items: TData[]) {
    if (items.length === 0) {
      this.items.reset();
    }
    else {
      wx.using(this.items.suppressChangeNotifications(), disp => {
        this.items.clear();
        this.items.addRange(items);
      });
    }
  }

  public getSelectedItems() {
    return this.items.filter(x => (x as any as ISelectableItem).isSelected === true);
  }
}
