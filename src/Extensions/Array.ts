import { Iterable } from 'ix';

declare global {
  interface Array<T> {
    asIterable(): Iterable<T>;
    filterNull<TFiltered>(this: Array<TFiltered | undefined | null>, callbackfn?: (value: TFiltered, index: number, array: Array<T | undefined | null>) => boolean): Array<TFiltered>;
  }
}

function asIterable<T>(this: T[]) {
  return Iterable.from(this);
}
Array.prototype.asIterable = asIterable;

function filterNull<T>(this: Array<T | undefined | null>, callbackfn?: (value: T, index: number, array: Array<T | undefined | null>) => boolean) {
  return (<Array<T>>this)
    .filter((x, i, a) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i, a);
    });
}
Array.prototype.filterNull = filterNull;
