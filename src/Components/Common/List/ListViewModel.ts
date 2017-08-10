import { Observable } from 'rxjs';
import { Iterable } from 'ix';

import { wx, IterableLike, ObservableLike, ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SelectableItem {
  isSelected: boolean;
}

export interface ItemsSource<T> {
  items: ArrayLike<T>;
}

export interface HierarchicalItemsSource<T extends HierarchicalItemsSource<T>> extends ItemsSource<T> {
}

export function filterHierarchical<T extends HierarchicalItemsSource<T>>(
  item: T,
  regexp: RegExp,
  test: (item: T, r: RegExp) => boolean,
): boolean {
  item.items = Iterable.from(item.items || [])
    .filter(x => filterHierarchical(x, regexp, test))
    .toArray();

  return test(item, regexp) || item.items.length > 0;
}

export function listItemSelectorIdentity<TData>(data: TData) {
  return data;
}

export class ListViewModel<TData, TItem, TRoutingState> extends BaseRoutableViewModel<TRoutingState> {
  public static displayName = 'ListViewModel';

  public readonly data: ReadOnlyProperty<Array<TData>>;
  public readonly items: ReadOnlyProperty<Array<TItem>>;
  public readonly selectedItem: ReadOnlyProperty<TItem | undefined>;
  public readonly hasItems: ReadOnlyProperty<boolean>;

  public readonly selectItem: Command<TItem | undefined>;
  protected readonly toggleSelection: Command<TItem>;

  constructor(
    data: ObservableLike<IterableLike<TData>>,
    listItemSelector?: (item: TData) => TItem,
    public readonly isMultiSelectEnabled = false,
    isRoutingEnabled?: boolean,
  ) {
    super(isRoutingEnabled);

    this.data = this.getObservable(data)
      .map(x => Iterable.from(x || []).toArray())
      .toProperty([]);

    if (listItemSelector != null) {
      this.items = this
        .whenAny(this.data, x => x)
        .map(x => {
          return Iterable
            .from(x || [])
            .map(y => listItemSelector(y))
            .toArray();
        })
        .toProperty([]);
    }

    this.selectItem = this.command<TItem>();
    this.toggleSelection = this.command<TItem>();

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
        // we have to do this here because we need to execute toggleSelection
        // before the new selection is persisted in selectedItem
        if (this.isMultiSelectEnabled === true) {
          this.toggleSelection.execute(x);
        }
      })
      .toProperty();

    this.hasItems = wx
      .whenAny(this.data, x => (x || []).length > 0)
      .toProperty(false);
  }

  public get dataSource() {
    return this.data;
  }

  public get itemsSource() {
    return this.items;
  }

  public isItemSelected(item: TItem) {
    return (this.isMultiSelectEnabled === true) ?
      (<SelectableItem><any>item).isSelected === true :
      this.selectedItem.value === item;
  }

  public getSelectedItems() {
    return Iterable.from(this.items.value || [])
      .filter(x => (<SelectableItem><any>x).isSelected === true)
      .toArray();
  }
}

export class SimpleListViewModel<TItem, TRoutingState> extends ListViewModel<TItem, TItem, TRoutingState> {
  constructor(
    items: ObservableLike<IterableLike<TItem>> = wx.property<TItem[]>([], false),
    isMultiSelectEnabled?: boolean,
    isRoutingEnabled?: boolean,
  ) {
    super(items, x => x, isMultiSelectEnabled, isRoutingEnabled);
  }
}
