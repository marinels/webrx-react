import { Enumerable } from 'ix';

import './Object';

declare global {
  interface Array<T> {
    asEnumerable(): Enumerable<T>;
  }
}

function asEnumerable<T>() {
  return Enumerable.fromArray(<T[]>this);
}

Array.prototype.asEnumerable = Object.fallback(Array.prototype.asEnumerable, asEnumerable);
