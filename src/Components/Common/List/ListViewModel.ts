import { Observable } from 'rxjs';

import { wx, ObservableOrProperty, ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SelectableItem {
  isSelected: boolean;
}

export interface ItemsSource<T> {
  items: T[];
}

export interface HierarchicalItemsSource<T extends HierarchicalItemsSource<T>> extends ItemsSource<T> {
}

export function filterHierarchical<T extends HierarchicalItemsSource<T>>(
  item: T,
  regexp: RegExp,
  test: (item: T, r: RegExp) => boolean,
) {
  item.items = (item.items || [])
    .filter(x => filterHierarchical(x, regexp, test));

  return test(item, regexp) || item.items.length > 0;
}

export class ListViewModel<TData, TRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  public static create<TData>(...items: TData[]) {
    return new ListViewModel(wx.property<TData[]>(items));
  }

  public readonly listItems: ReadOnlyProperty<TData[]>;
  public readonly items: ReadOnlyProperty<TData[]>;
  public readonly selectedItem: ReadOnlyProperty<TData>;

  public readonly selectItem: Command<TData>;
  protected readonly toggleSelection: Command<TData>;

  constructor(
    items: ObservableOrProperty<TData[]> = wx.property<TData[]>([]),
    public readonly isMultiSelectEnabled = false,
    isRoutingEnabled?: boolean,
  ) {
    super(isRoutingEnabled);

    if (wx.isProperty(items)) {
      this.listItems = <ReadOnlyProperty<TData[]>>items;
    }
    else {
      this.listItems = (<Observable<TData[]>>items).toProperty([]);
    }

    this.items = this.listItems;

    this.selectItem = this.command<TData>();
    this.toggleSelection = this.command<TData>();

    if (this.isMultiSelectEnabled === true) {
      this.addSubscription(
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
      this.selectedItem.value === item;
  }

  public getSelectedItems() {
    return (this.items.value || [])
      .filter(x => (<SelectableItem><any>x).isSelected === true);
  }
}
