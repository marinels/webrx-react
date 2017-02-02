import { Enumerable } from 'ix';

declare global {
  interface ObjectConstructor {
    assign<T>(target: any, ...sources: any[]): T;
    rest<TData, TProps>(data: TData, propsCreator?: (x: TData) => TProps, ...omits: string[]): { rest: TData, props: TProps };
    dispose<T>(disposable: T, returnNull?: boolean): T;
    getName(source: any, undefinedValue?: string): string;
    fallback<T>(...values: T[]): T;
    fallbackAsync<T>(...actions: (T | (() => T))[]): T;
    getEnumPropertyDescriptors<T>(type: any): EnumPropertyDescriptor<T>[];
    getEnumNames(type: any): string[];
    getEnumValues<T>(type: any): T[];
  }
}

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

// this extension solves the Unknown Prop Warning that is experienced in
// typescript when using Rest and Spread Properties
// see: https://facebook.github.io/react/warnings/unknown-prop.html
// see: https://facebook.github.io/react/docs/transferring-props.html
function rest<TData, TProps>(data: TData, propsCreator?: (x: TData) => TProps, ...omits: string[]) {
  const rest = <TData>{};
  const props = propsCreator == null ? <TProps>{} : <TProps>propsCreator.apply(this, [ data ]);

  Object
    .getOwnPropertyNames(data)
    .filter(x => props.hasOwnProperty(x) === false && omits.indexOf(x) < 0)
    .forEach(x => {
      (<any>rest)[x] = (<any>data)[x];
    });

  return {
    rest,
    props,
  };
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
  const displayNameProperty = 'displayName';
  const typeNameProperty = 'typeName';
  const nameProperty = 'name';

  let name: string = null;

  if (source != null) {
    if (typeof source === 'string') {
      name = source;
    }
    else if (source.hasOwnProperty(displayNameProperty)) {
      name = source[displayNameProperty];
    }
    else if (source.hasOwnProperty(typeNameProperty)) {
      name = source[typeNameProperty];
    }
    else if (source.hasOwnProperty(nameProperty)) {
      name = source[nameProperty];
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
  return Enumerable
    .fromArray(values)
    .filter(x => x != null)
    .firstOrDefault();
}

function fallbackAsync<T>(...actions: (T | (() => T))[]) {
  return Enumerable
    .fromArray(actions)
    .map(x => x instanceof Function ? x.apply(this) : x)
    .filter(x => x != null)
    .firstOrDefault();
}

interface EnumPropertyDescriptor<T> {
  name: string;
  value: number;
  type: T;
}

function getEnumPropertyDescriptors<T>(type: any) {
  return Object.keys(type)
    .map(x => parseInt(x))
    .filter(x => x >= 0)
    .map(value => <EnumPropertyDescriptor<T>>{
      name: type[value],
      value,
      type: <T><any>value,
    });
}

function getEnumNames(type: any) {
  return getEnumPropertyDescriptors<any>(type)
    .map(x => x.name);
}

function getEnumValues<T>(type: T) {
  return getEnumPropertyDescriptors<T>(type)
    .map(x => x.type);
}

Object.assign = fallback(Object.assign, assign);
Object.rest = fallback(Object.rest, rest);
Object.dispose = fallback(Object.dispose, dispose);
Object.getName = fallback(Object.getName, getName);
Object.fallback = fallback(Object.fallback, fallback);
Object.fallbackAsync = fallback(Object.fallbackAsync, fallbackAsync);
Object.getEnumPropertyDescriptors = fallback(Object.getEnumPropertyDescriptors, getEnumPropertyDescriptors);
Object.getEnumNames = fallback(Object.getEnumNames, getEnumNames);
Object.getEnumValues = fallback(Object.getEnumValues, getEnumValues);
