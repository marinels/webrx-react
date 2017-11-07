import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { IterableLike, ObservableLike, ReadOnlyProperty, Command } from '../../../WebRx';
import { ItemsViewModel } from '../Items/ItemsViewModel';
import { ListItemsViewModel } from './ListItemsViewModel';

export function flattenItems<T>(
  item: T,
  itemsSource: (item: T) => (IterableLike<T> | undefined),
): Iterable<T> {
  const items = itemsSource(item);

  return items == null ?
    Iterable.of(item) :
    Iterable
      .from(items)
      .flatMap(x => flattenItems(x, itemsSource))
      .startWith(item);
}

export class TreeListItemsViewModel<T> extends ListItemsViewModel<T> {
  public static displayName = 'TreeListItemsViewModel';

  constructor(
    protected readonly itemsSource: (item: T) => (IterableLike<T> | undefined),
    source?: ObservableLike<IterableLike<T>>,
  ) {
    super(source);
  }

  getItems() {
    return Iterable
      .from(this.getItemsSource())
      .flatMap(x => this.flattenItems(x));
  }

  getItemsForIndicies(indicies: IterableLike<number>) {
    return undefined;
  }

  getIndiciesForItems(items: IterableLike<T>) {
    return undefined;
  }

  protected flattenItems(item: T): Iterable<T> {
    return flattenItems(item, this.itemsSource);
  }
}
