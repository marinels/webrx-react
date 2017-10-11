import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableLike, ReadOnlyProperty, Command } from '../../../WebRx';
import { ItemsViewModel } from '../Items/ItemsViewModel';

export class ListItemsViewModel<T> extends ItemsViewModel<T> {
  public static displayName = 'ListItemsViewModel';

  public readonly selectedItem: ReadOnlyProperty<T>;
  public readonly selectedItems: ReadOnlyProperty<Array<T>>;
  public readonly selectedIndex: ReadOnlyProperty<number>;
  public readonly selectedIndicies: ReadOnlyProperty<Array<number>>;

  public readonly selectItem: Command<T>;
  public readonly selectItems: Command<Array<T>>;
  public readonly selectIndex: Command<number>;
  public readonly selectIndicies: Command<Array<number>>;
  public readonly selectRange: Command<{ from: T, to: T }>;

  constructor(
    source?: ObservableLike<IterableLike<T>>,
  ) {
    super(source);

    this.selectItem = this.command<T>();
    this.selectItems = this.command<Array<T>>();
    this.selectIndex = this.command<number>();
    this.selectIndicies = this.command<Array<number>>();
    this.selectRange = this.command<{ from: T, to: T }>();

    this.selectedItems = Observable
      .merge(
        this.selectItem.results.map(x => [ x ]),
        this.selectItems.results,
      )
      .map(x => x.filterNull())
      .toProperty([], (a, b) => Iterable.from(a).sequenceEqual(Iterable.from(b)));

    this.selectedIndicies = Observable
      .merge(
        this.selectIndex.results.map(x => [ x ]),
        this.selectIndicies.results,
      )
      .map(x => x.filterNull())
      .toProperty([], (a, b) => Iterable.from(a).sequenceEqual(Iterable.from(b)));

    this.selectedItem = this
      .whenAny(this.selectedItems, x => x[0])
      .toProperty();

    this.selectedIndex = this
      .whenAny(this.selectedIndicies, x => x[0])
      .toProperty();

    this.addSubscription(
      this
        .whenAny(this.selectRange, x => x)
        .map(range => {
          if (range.from == null || range.to == null) {
            return [];
          }

          if (range.from === range.to) {
            return [ range.from ];
          }

          const leftBound = this.getItems()
            .skipWhile(x => x !== range.from && x !== range.to);

          const initial = leftBound.first();

          if (initial == null) {
            return [];
          }

          const end = initial === range.from ? range.to : range.from;

          return leftBound
            .reverse()
            .skipWhile(x => x !== end)
            .reverse()
            .toArray();
        })
        .invokeCommand(this.selectItems),
    );

    this.addSubscription(
      this
        .whenAny(this.selectedIndicies, x => x)
        .map(x => {
          return this.getItemsForIndicies(x);
        })
        .filterNull()
        .invokeCommand(this.selectItems),
    );

    this.addSubscription(
      this
        .whenAny(this.selectedItems, x => x)
        .map(x => {
          return this.getIndiciesForItems(x);
        })
        .filterNull()
        .invokeCommand(this.selectIndicies),
    );
  }

  protected getItemsForIndicies(indicies: IterableLike<number>): Array<T> | undefined {
    const set = this.getItems()
      .toArray();

    return Iterable
      .from(indicies)
      .map(x => set[x])
      .toArray();
  }

  protected getIndiciesForItems(items: IterableLike<T>): Array<number> | undefined {
    const set = this.getItems()
      .toArray();

    return Iterable
      .from(items)
      .map(x => set.indexOf(x))
      .toArray();
  }
}

export class TreeListItemsViewModel<T> extends ListItemsViewModel<T> {
  constructor(
    protected itemsSource: (item: T) => (IterableLike<T> | undefined),
    source?: ObservableLike<IterableLike<T>>,
  ) {
    super(source);
  }

  getItems() {
    return Iterable
      .from(this.source.value)
      .flatMap(x => this.flattenItems(x));
  }

  getItemsForIndicies(indicies: IterableLike<number>) {
    return undefined;
  }

  getIndiciesForItems(items: IterableLike<T>) {
    return undefined;
  }

  protected flattenItems(item: T): Iterable<T> {
    const items = this.itemsSource(item);

    return items == null ?
      Iterable.of(item) :
      Iterable
        .from(items)
        .flatMap(x => this.flattenItems(x))
        .startWith(item);
  }
}
