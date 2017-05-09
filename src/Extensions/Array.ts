import { Enumerable } from 'ix';

import './Object';

declare global {
  interface Array<T> {
    asEnumerable(): Enumerable<T>;
    filterNull<T>(this: Array<T | undefined | null>): Array<T>;
  }
}

function asEnumerable<T>() {
  return Enumerable.fromArray(<T[]>this);
}
Array.prototype.asEnumerable = Object.fallback(Array.prototype.asEnumerable, asEnumerable);

function filterNull<T>(this: Array<T | undefined | null>) {
  return this
    .filter(x => x != null);
}
Array.prototype.filterNull = filterNull;
