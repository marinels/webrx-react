import { Iterable } from 'ix';

export function asIterable<T>(this: T[]): Iterable<T> {
  return Iterable.from(this);
}

export function filterNull<T>(
  this: Array<T | undefined | null>,
  callbackfn?: (
    value: T,
    index: number,
    array: Array<T | undefined | null>,
  ) => boolean,
): T[] {
  return (this as T[]).filter((x, i, a) => {
    if (x == null) {
      return false;
    }

    return callbackfn == null ? true : callbackfn(x, i, a);
  });
}

declare global {
  interface Array<T> {
    asIterable: typeof asIterable;
    filterNull: typeof filterNull;
  }
}

Array.prototype.asIterable = asIterable;
Array.prototype.filterNull = filterNull;
