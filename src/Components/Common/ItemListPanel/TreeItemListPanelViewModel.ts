import { Iterable } from 'ix';
import { Observable } from 'rxjs';

import { ObservableOrValue, ObservableLike, IterableLike } from '../../../WebRx';
import { ItemListPanelViewModel } from './ItemListPanelViewModel';
import { SearchViewModel, SearchRequest } from '../Search/SearchViewModel';
import { flattenItems } from '../ListItems/TreeListItemsViewModel';

export function filterTreeItems<T>(
  items: IterableLike<T> | undefined,
  itemsSource: (item: T) => (IterableLike<T> | undefined),
  itemsAssign: (item: T, items: Iterable<T>) => T,
  filter: (item: T) => boolean,
): Iterable<T> {
  if (items == null) {
    return Iterable.empty<T>();
  }

  return Iterable
    .from(items)
    .map(x => {
      const result = filterTreeItems(itemsSource(x), itemsSource, itemsAssign, filter);

      if (result.some(() => true) || filter(x)) {
        return itemsAssign(x, result);
      }

      return undefined;
    })
    .filterNull();
}

export class TreeItemListPanelViewModel<T, TRequestContext = any> extends ItemListPanelViewModel<T, TRequestContext> {
  public static displayName = 'TreeItemListPanelViewModel';

  constructor(
    protected readonly itemsSource: (item: T) => (IterableLike<T> | undefined),
    protected readonly itemsAssign: (item: T, items: Iterable<T>) => T,
    source?: ObservableLike<IterableLike<T>>,
    filterer?: (item: T, search: SearchRequest) => boolean,
    search?: SearchViewModel | null,
    context?: ObservableLike<TRequestContext>,
  ) {
    super(source, filterer, search, null, context);
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

  getFilteredItems(items: Iterable<T>, searchRequest: SearchRequest) {
    return filterTreeItems(items, this.itemsSource, this.itemsAssign, x => this.filterer!(x, searchRequest));
  }

  protected flattenItems(item: T): Iterable<T> {
    return flattenItems(item, this.itemsSource);
  }
}
