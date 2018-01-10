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

  /**
   * @param source data source.
   * @param itemsSource delegate to produce sub-items from a source item.
   * @param itemsAssign delegate to produce a source item with the sub-items assigned.
   * @param filterer filter predicate. executed for each item when the search context is available.
   * @param search search handler. if omitted a default search handler will be created. use null for no search handling.
   * @param context request context included in projection requests. if included requests are bound to context events.
   */
  constructor(
    source: ObservableLike<IterableLike<T>>,
    protected readonly itemsSource: (item: T) => (IterableLike<T> | undefined),
    protected readonly itemsAssign: (item: T, items: Iterable<T>) => T,
    filterer?: (item: T, search: SearchRequest) => boolean,
    search?: SearchViewModel | null,
    context?: ObservableLike<TRequestContext>,
    rateLimit?: number,
  ) {
    super(source, filterer, search, null, context, undefined, rateLimit);
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
