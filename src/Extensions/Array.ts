import { Enumerable } from 'ix';

import './Object';

declare global {
  interface Array<T> {
    asEnumerable(): Enumerable<T>;
    filterNull<T>(this: Array<T | undefined | null>, callbackfn?: (value: T, index: number, array: Array<T | undefined | null>) => boolean): Array<T>;
  }
}

function asEnumerable<T>(this: T[]) {
  return Enumerable.fromArray(this);
}
Array.prototype.asEnumerable = Object.fallback(Array.prototype.asEnumerable, asEnumerable);

function filterNull<T>(this: Array<T | undefined | null>, callbackfn?: (value: T, index: number, array: Array<T | undefined | null>) => boolean) {
  return this
    .filter((x, i, a) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i, a);
    });
}
Array.prototype.filterNull = filterNull;
