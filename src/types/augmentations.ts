// tslint:disable:no-unused-variable

import { Enumerable, OrderedEnumerable, Comparer } from 'ix';

// we want to reuse the createOrderedEnumerable that comes with OrderedEnumerable
interface OrderedEnumerablePrototype<T> extends OrderedEnumerable<T> {
  createOrderedEnumerable<TKey>(keySelector: (item: T) => TKey, comparer: Comparer<TKey, TKey> | undefined, descending: boolean): OrderedEnumerable<T>;
}

function thenBy<T, TKey>(
  this: OrderedEnumerablePrototype<T>,
  keySelector: (item: T) => TKey,
  comparer?: Comparer<TKey, TKey>,
) {
  return this.createOrderedEnumerable(keySelector, comparer, false);
}

function thenByDescending<T, TKey>(
  this: OrderedEnumerablePrototype<T>,
  keySelector: (item: T) => TKey,
  comparer?: Comparer<TKey, TKey>,
) {
  return this.createOrderedEnumerable(keySelector, comparer, true);
}

// reach in and grab the OrderedEnumerable prototype by creating an ordered enumerable
try {
  const orderedEnumerablePrototype: OrderedEnumerablePrototype<any> = (<any>Enumerable)
    .empty()
    .orderBy(undefined)
    .__proto__
    .constructor
    .prototype;

  orderedEnumerablePrototype.thenBy = thenBy;
  orderedEnumerablePrototype.thenByDescending = thenByDescending;
}
catch (e) {
  // don't crash when we import this module if we are not able to augment
}
