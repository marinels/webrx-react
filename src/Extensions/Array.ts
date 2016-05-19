/// <reference path="./Extensions.d.ts"/>

import * as Ix from 'ix';

function asEnumerable<T>() {
  return Ix.Enumerable.fromArray(<T[]>this);
}

Array.prototype.asEnumerable = Object.getValueOrDefault(Array.prototype.asEnumerable, asEnumerable);
