/// <reference path="./Extensions.d.ts"/>

'use strict';

import * as Rx from 'rx';

function assign<T>(target: any, ...sources: any[]) {
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

  return to as T;
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

function getName(source: any, undefinedValue = 'undefined', isStatic = false) {
  const typeNameProperty = 'typeName';
  const displayNameProperty = 'displayName';
  const nameProperty = 'name';

  interface ITypeName {
    typeName: string;
  }

  interface IDisplayName {
    displayName: string;
  }

  interface IName {
    name: string;
  }

  let name: string = null;

  if (source) {
    if (source.hasOwnProperty(typeNameProperty)) {
      name = (source as ITypeName).typeName;
    } else if (source.hasOwnProperty(displayNameProperty)) {
      name = (source as IDisplayName).displayName;
    } else if (source.hasOwnProperty(nameProperty)) {
      name = (source as IName).name;
    } else if (source.constructor != null) {
      // this allows us to inspect the static properties of the source object
      // but we don't want to go beyond the the static properties
      if (isStatic === false) {
        name = getName(source.constructor, undefinedValue, true);
      } else {
        // IE is pretty dumb and doesn't expose any useful naming properties
        // so we can try and extract it from the toString()
        let match = /function (.+)\(/.exec(source.toString());
        if (match != null && match.length >= 2) {
          name = match[1];
        }
      }
    }
  }

  if (name == null) {
    name = undefinedValue;
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
