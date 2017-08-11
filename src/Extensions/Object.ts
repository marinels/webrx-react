import { Enumerable } from 'ix';

declare global {
  interface ObjectConstructor {
    assign<T>(target: any, ...sources: any[]): T;
    rest<TData extends StringMap<any>, TProps>(data: TData, propsCreator?: (x: TData) => TProps, ...omits: string[]): { rest: TData, props: TProps };
    getName(source: any, undefinedValue?: string): string;
    fallback<T>(...values: T[]): T;
    fallbackAsync<T>(...actions: (T | (() => T))[]): T;
    getEnumPropertyDescriptors<T>(type: any): EnumPropertyDescriptor<T>[];
    getEnumNames(type: any): string[];
    getEnumValues<T>(type: any): T[];
    getPropName<T>(p: (x: T) => any): string;
  }
}

function assign<T>(target: any, ...sources: any[]): T {
  if (target == null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  return sources
    .filter(x => x != null)
    .reduce((to, source) => {
      Object
        .keys(source)
        .filter(key => Object.prototype.hasOwnProperty.call(source, key))
        .forEach(key => {
          to[key] = source[key];
        });

      return to;
    }, Object(target));
}
Object.assign = Object.assign || assign;

// this extension solves the Unknown Prop Warning that is experienced in
// typescript when using Rest and Spread Properties
// see: https://facebook.github.io/react/warnings/unknown-prop.html
// see: https://facebook.github.io/react/docs/transferring-props.html
function rest<TData extends StringMap<any>, TProps>(data: TData, propsCreator?: (x: TData) => TProps, ...omits: string[]) {
  const props = propsCreator == null ? <TProps>{} : propsCreator(data);

  const restParams = Object
    .keys(data)
    .filter(key => props.hasOwnProperty(key) === false && omits.indexOf(key) < 0)
    .reduce((r, key) => {
      r[key] = data[key];

      return r;
    }, <TData>{});

  return { rest: restParams, props };
}
Object.rest = rest;

interface NamedObject {
  displayName?: string;
  typeName?: string;
  name?: string;

  constructor?: NamedObject;
}

function getName(source: NamedObject, undefinedValue = 'undefined', isStatic = false): string {
  if (source != null) {
    if (String.isString(source)) {
      return source;
    }
    else if (String.isNullOrEmpty(source.displayName) === false) {
      return source.displayName!;
    }
    else if (String.isNullOrEmpty(source.typeName) === false) {
      return source.typeName!;
    }
    else if (String.isNullOrEmpty(source.name) === false) {
      return source.name!;
    }
    else if (source.constructor != null) {
      // this allows us to inspect the static properties of the source object
      // but we don't want to go beyond the the static properties
      if (isStatic === false) {
        const name = getName(source.constructor, undefinedValue, true);

        if (String.isNullOrEmpty(name) === false) {
          return name;
        }
      }
      else {
        // IE is pretty dumb and doesn't expose any useful naming properties
        // so we can try and extract it from the toString()
        let match = /function (.+)\(/.exec(source.toString());
        if (match != null && match.length >= 2) {
          if (String.isNullOrEmpty(match[1]) === false) {
            return match[1];
          }
        }
      }
    }
  }

  return undefinedValue;
}
Object.getName = getName;

// NOTE: we can't share code between this an the async variant because
//       we don't want functions passed in here to evaluate and we don't
//       want to evaluate all async functions ahead of time.
function fallback<T>(...values: T[]) {
  return Enumerable
    .fromArray(values)
    .filter(x => x != null)
    .firstOrDefault();
}
Object.fallback = fallback;

function fallbackAsync<T>(...actions: (T | (() => T))[]) {
  return Enumerable
    .fromArray(actions)
    .map(x => x instanceof Function ? x() : x)
    .filter(x => x != null)
    .firstOrDefault();
}
Object.fallbackAsync = fallbackAsync;

export interface EnumPropertyDescriptor<T> {
  name: string;
  value: number;
  type: T;
}

function getEnumPropertyDescriptors<T>(type: any) {
  return Object
    .keys(type)
    .map(x => parseInt(x))
    .filter(x => x >= 0)
    .map(value => <EnumPropertyDescriptor<T>>{
      name: type[value],
      value,
      type: <T><any>value,
    });
}
Object.getEnumPropertyDescriptors = getEnumPropertyDescriptors;

function getEnumNames(type: any) {
  return getEnumPropertyDescriptors<any>(type)
    .map(x => x.name);
}
Object.getEnumNames = getEnumNames;

function getEnumValues<T>(type: T) {
  return getEnumPropertyDescriptors<T>(type)
    .map(x => x.type);
}
Object.getEnumValues = getEnumValues;

/**
 *  Get object property name: http://stackoverflow.com/questions/37048274/typescript-how-to-get-objects-property-name-from-its-value
 * @param {p: (x: T) => any} function which returns any object property
 * @returns {string} property name
 */
function getPropName<T>(p: (x: T) => any): string {
  return (/\.([^\.;]+);?\s*\}$/.exec(p.toString()) || [])[1];
}
Object.getPropName = getPropName;
