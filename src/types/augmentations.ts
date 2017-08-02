// tslint:disable:no-unused-variable

import { Enumerable, OrderedEnumerable, Comparer } from 'ix';

// we want to reuse the createOrderedEnumerable that comes with OrderedEnumerable
interface OrderedEnumerablePrototype<T> extends OrderedEnumerable<T> {
  createOrderedEnumerable<TKey>(keySelector: (item: T) => TKey, comparer: Comparer<TKey, TKey> | undefined, descending: boolean): OrderedEnumerable<T>;
}

// reach in and grab the OrderedEnumerable prototype by creating an ordered enumerable
const orderedEnumerablePrototype: OrderedEnumerablePrototype<any> = (<any>Enumerable)
  .empty()
  .orderBy(undefined)
  .__proto__
  .constructor
  .prototype;

function thenBy<T, TKey>(
  this: OrderedEnumerablePrototype<T>,
  keySelector: (item: T) => TKey,
  comparer?: Comparer<TKey, TKey>,
) {
  return this.createOrderedEnumerable(keySelector, comparer, false);
}
orderedEnumerablePrototype.thenBy = thenBy;

function thenByDescending<T, TKey>(
  this: OrderedEnumerablePrototype<T>,
  keySelector: (item: T) => TKey,
  comparer?: Comparer<TKey, TKey>,
) {
  return this.createOrderedEnumerable(keySelector, comparer, true);
}
orderedEnumerablePrototype.thenByDescending = thenByDescending;
