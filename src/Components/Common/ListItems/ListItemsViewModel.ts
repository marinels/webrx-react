import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import {
  Command,
  IterableLike,
  ObservableLike,
  ReadOnlyProperty,
} from '../../../WebRx';
import { ItemsViewModel } from '../Items/ItemsViewModel';

export class ListItemsViewModel<T> extends ItemsViewModel<T> {
  public static displayName = 'ListItemsViewModel';

  public readonly selectedItem: ReadOnlyProperty<T>;
  public readonly selectedItems: ReadOnlyProperty<T[]>;
  public readonly selectedIndex: ReadOnlyProperty<number>;
  public readonly selectedIndicies: ReadOnlyProperty<number[]>;

  public readonly selectItem: Command<T>;
  public readonly selectItems: Command<T[]>;
  public readonly selectIndex: Command<number>;
  public readonly selectIndicies: Command<number[]>;
  public readonly selectRange: Command<{ from: T; to: T }>;

  constructor(source: ObservableLike<IterableLike<T>>) {
    super(source);

    this.selectItem = this.wx.command<T>();
    this.selectItems = this.wx.command<T[]>();
    this.selectIndex = this.wx.command<number>();
    this.selectIndicies = this.wx.command<number[]>();
    this.selectRange = this.wx.command<{ from: T; to: T }>();

    this.selectedItems = Observable.merge(
      this.selectItem.results.map(x => [x]),
      this.selectItems.results,
    )
      .map(x => x.filterNull())
      .toProperty([], (a, b) =>
        Iterable.from(a).sequenceEqual(Iterable.from(b)),
      );

    this.selectedIndicies = Observable.merge(
      this.selectIndex.results.map(x => [x]),
      this.selectIndicies.results,
    )
      .map(x => x.filterNull())
      .toProperty([], (a, b) =>
        Iterable.from(a).sequenceEqual(Iterable.from(b)),
      );

    this.selectedItem = this.wx
      .whenAny(this.selectedItems, x => x[0])
      .toProperty();

    this.selectedIndex = this.wx
      .whenAny(this.selectedIndicies, x => x[0])
      .toProperty();

    this.addSubscription(
      this.wx
        .whenAny(this.selectRange, x => x)
        .map(range => {
          if (range.from == null || range.to == null) {
            return [];
          }

          if (range.from === range.to) {
            return [range.from];
          }

          const leftBound = this.getItems().skipWhile(
            x => x !== range.from && x !== range.to,
          );

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
      this.wx
        .whenAny(this.selectedIndicies, x => x)
        .map(x => {
          return this.getItemsForIndicies(x);
        })
        .filterNull()
        .invokeCommand(this.selectItems),
    );

    this.addSubscription(
      this.wx
        .whenAny(this.selectedItems, x => x)
        .map(x => {
          return this.getIndiciesForItems(x);
        })
        .filterNull()
        .invokeCommand(this.selectIndicies),
    );
  }

  protected getItemsForIndicies(
    indicies: IterableLike<number>,
  ): T[] | undefined {
    const source = Iterable.from(indicies);

    if (source.isEmpty()) {
      return [];
    }

    const set = this.getItems().toArray();

    return source.map(x => set[x]).toArray();
  }

  protected getIndiciesForItems(items: IterableLike<T>): number[] | undefined {
    const source = Iterable.from(items);

    if (source.isEmpty()) {
      return [];
    }

    const set = this.getItems().toArray();

    return Iterable.from(items)
      .map(x => set.indexOf(x))
      .toArray();
  }
}
