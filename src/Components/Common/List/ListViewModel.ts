import { Observable } from 'rx';

import { wx } from '../../../WebRx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SelectableItem {
  isSelected: boolean;
}

export class ListViewModel<TData, TRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  public static create<TData>(...items: TData[]) {
    return new ListViewModel(wx.property<TData[]>(items));
  }

  public items: wx.IObservableReadOnlyProperty<TData[]>;
  public selectedItem: wx.IObservableReadOnlyProperty<TData>;

  public selectItem: wx.ICommand<TData>;
  protected toggleSelection: wx.ICommand<TData>;

  constructor(
    items: wx.ObservableOrProperty<TData[]> = wx.property<TData[]>([]),
    public isMultiSelectEnabled = false,
    isRoutingEnabled?: boolean,
  ) {
    super(isRoutingEnabled);

    if (wx.isProperty(items)) {
      this.items = <wx.IObservableReadOnlyProperty<TData[]>>items;
    }
    else {
      this.items = (<Observable<TData[]>>items).toProperty([]);
    }

    this.selectItem = wx.asyncCommand((x: TData) => Observable.of(x));
    this.toggleSelection = wx.asyncCommand((x: TData) => Observable.of(x));

    if (this.isMultiSelectEnabled === true) {
      this.subscribe(
        wx
          .whenAny(this.toggleSelection.results, x => x)
          .subscribe(x => {
            const selectable = <SelectableItem><any>x;

            selectable.isSelected = !(selectable.isSelected || false);

            this.notifyChanged();
          }),
      );
    }

    this.selectedItem = wx
      .whenAny(this.selectItem.results, x => x)
      .do(x => {
        if (this.isMultiSelectEnabled === true) {
          this.toggleSelection.execute(x);
        }
      })
      .toProperty();
  }

  public get hasItems() {
    return wx
      .whenAny(this.items, x => (x || []).length > 0);
  }

  public isItemSelected(item: TData) {
    return (this.isMultiSelectEnabled === true) ?
      (<SelectableItem><any>item).isSelected === true :
      this.selectedItem() === item;
  }

  public getSelectedItems() {
    return (this.items() || [])
      .filter(x => (<SelectableItem><any>x).isSelected === true);
  }
}
