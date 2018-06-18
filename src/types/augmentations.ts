// tslint:disable:no-unused-variable no-shadowed-variable

// include additional imports
import './imports';

import { AsyncIterableX } from 'ix/asynciterable/asynciterablex';
import { IterableX } from 'ix/iterable/iterablex';

declare module 'ix/iterable/concat' {
  // @ts-ignore: static function overload augmentation
  function concat<T>(
    source: IterableX<T>,
    ...args: Array<Iterable<T>>
  ): IterableX<T>;
}

declare module 'ix/asynciterable/concat' {
  // @ts-ignore: static function overload augmentation
  function concat<T>(
    source: AsyncIterableX<T>,
    ...args: Array<AsyncIterable<T>>
  ): AsyncIterableX<T>;
}

declare module 'ix/asynciterable/merge' {
  // @ts-ignore: static function overload augmentation
  function merge<T>(
    source: AsyncIterableX<T>,
    ...args: Array<AsyncIterable<T>>
  ): AsyncIterableX<T>;
}

declare global {
  interface Function {
    // tslint:disable-next-line:ban-types
    bind<T extends Function>(this: T, thisArg: any, ...argArray: any[]): T;
  }
}
