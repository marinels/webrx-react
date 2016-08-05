declare global {
  interface Array<T> {
    asEnumerable(): Ix.Enumerable<T>;
  }
}

import * as Ix from 'ix';
import './Object';

function asEnumerable<T>() {
  return Ix.Enumerable.fromArray(<T[]>this);
}

Array.prototype.asEnumerable = Object.fallback(Array.prototype.asEnumerable, asEnumerable);
