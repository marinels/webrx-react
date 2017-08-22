// tslint:disable:no-unused-variable no-shadowed-variable

import { Iterable } from 'ix';

export function filterNull<TFiltered>(this: Iterable<TFiltered | undefined | null>, callbackfn?: (value: TFiltered, index: number) => boolean): Iterable<TFiltered> {
  return (<Iterable<TFiltered>>this)
    .filter((x, i) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i);
    });
}

declare module 'ix/types/iterable' {
  interface IterableX<T> {
    filterNull: typeof filterNull;
  }
}
Iterable.prototype.filterNull = filterNull;
