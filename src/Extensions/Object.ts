/// <reference path="./Extensions.d.ts"/>

import * as Ix from 'ix';

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

// these extensions solve the Unknown Prop Warning that is experienced in
// typescript when using Rest and Spread Properties
// see: https://facebook.github.io/react/warnings/unknown-prop.html
// see: https://facebook.github.io/react/docs/transferring-props.html
function deconstruct<TResult, TData>(
  result: TResult,
  data: TData,
  onHit: (result: TResult, data: TData, x: string) => void,
  onMiss: (result: TResult, data: TData, x: string) => void,
  propNames: string[]
  ) {

  Object
    .getOwnPropertyNames(data)
    .forEach(x => {
      if (propNames.indexOf(x) < 0) {
        if (onMiss != null) {
          onMiss(result, data, x);
        }
      }
      else {
        if (onHit != null) {
          onHit(result, data, x);
        }
      }
    });

  return result;
}

function destruct<T>(data: T, ...propNames: string[]) {
  return deconstruct(
    [ <T>{}, <T>{} ],
    data,
    (r, d, x) => (<any>r[0])[x] = (<any>d)[x],
    (r, d, x) => (<any>r[1])[x] = (<any>d)[x],
    propNames
  );
}

function destructProps(data: any, ...propNames: string[]) {
  return deconstruct(
    [ <any>{} ],
    data,
    (r, d, x) => r.splice(r.length - 1, 0, d[x]),
    (r, d, x) => r[r.length - 1][x] = d[x],
    propNames
  );
}

function omit<T>(data: T, ...propNames: string[]) {
  return deconstruct(
    <T>{},
    data,
    null,
    (r, d, x) => (<any>r)[x] = (<any>d)[x],
    propNames
  );
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
    }
    else if (source.hasOwnProperty(displayNameProperty)) {
      name = (source as IDisplayName).displayName;
    }
    else if (source.hasOwnProperty(nameProperty)) {
      name = (source as IName).name;
    }
    else if (source.constructor != null) {
      // this allows us to inspect the static properties of the source object
      // but we don't want to go beyond the the static properties
      if (isStatic === false) {
        name = getName(source.constructor, undefinedValue, true);
      }
      else {
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

function fallback<T>(...values: T[]) {
  return Ix.Enumerable
    .fromArray(values)
    .where(x => x != null)
    .firstOrDefault();
}

function fallbackAsync<T>(...actions: (T | (() => T))[]) {
  return Ix.Enumerable
    .fromArray(actions)
    .select(x => x instanceof Function ? x.apply(this) : x)
    .where(x => x != null)
    .firstOrDefault();
}

Object.assign = fallback(Object.assign, assign);
Object.destruct = fallback(Object.destruct, destruct);
Object.destructProps = fallback(Object.destructProps, destructProps);
Object.omit = fallback(Object.omit, omit);
Object.dispose = fallback(Object.dispose, dispose);
Object.getName = fallback(Object.getName, getName);
Object.fallback = fallback(Object.fallback, fallback);
Object.fallbackAsync = fallback(Object.fallbackAsync, fallbackAsync);
