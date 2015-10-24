/// <reference path="./Extensions.d.ts"/>

'use strict';

import * as Rx from 'rx';

function assign(target: Object, ...sources: Object[]) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  let to = Object(target);

  for (let i = 0; i < sources.length; i++) {
    let nextSource = sources[i] as PropertyDescriptorMap;

    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    nextSource = Object(nextSource);

    let keysArray = Object.keys(Object(nextSource));

    for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      let nextKey = keysArray[nextIndex];
      let desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);

      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }

  return to;
}

function dispose<T>(disposable: T, returnNull = true) {
  if (disposable) {
    let dispose = (disposable as any).dispose as Function;

    if (dispose && dispose instanceof Function) {
      dispose.apply(disposable);
    }
  }

  return returnNull ? null : disposable;
}

function getName(source: any, undefined = 'undefined') {
  let name: string = null;

  if (source) {
    if (source.displayName) {
      name = source.displayName;
    } else if (source instanceof Function) {
      name = source.name;
    } else if (source.constructor) {
      name = source.constructor.name;
    }
  }

  if (name == null) {
    name = undefined;
  }

  return name;
}

function getValueOrDefault<T>(value: T, defaultValue: T) {
  return value ? value : defaultValue;
}

Object.assign = getValueOrDefault(Object.assign, assign);
Object.dispose = getValueOrDefault(Object.dispose, dispose);
Object.getName = getValueOrDefault(Object.getName, getName);
Object.getValueOrDefault = getValueOrDefault(Object.getValueOrDefault, getValueOrDefault);
