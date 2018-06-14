import { Iterable } from 'ix';

export function isObject(value: any): value is {} {
  return typeof value === 'object' || value instanceof Object;
}

export function trim<T extends {}>(obj: T, trimNull = true): T {
  if (isObject(obj)) {
    return Iterable
      .from(Object.keys(obj))
      .reduce(
        (o: any, x) => {
          if ((trimNull && o[x] === null) || o[x] === undefined) {
            delete o[x];
          }

          return o;
        },
        obj,
      );
  }

  return obj;
}

export interface RestResult<P, T, R> {
  props: T;
  rest: Omit2<P, T, R>;
  removals: R;
}

// this extension solves the Unknown Prop Warning that is experienced in
// typescript when using Rest and Spread Properties
// see: https://facebook.github.io/react/warnings/unknown-prop.html
// see: https://facebook.github.io/react/docs/transferring-props.html
export function rest<P extends {}, T, R extends {} = {}>(
  data: P,
  propsCreator?: (x: P) => T,
  removals?: R,
): RestResult<P, T, R> {
  const map = {
    data: (data as StringMap<any>) || {},
    props: (propsCreator == null ? undefined : propsCreator(data)) || {},
    removals: removals || {},
  };

  const result = {
    rest: {} as StringMap<any>,
    removals: {} as StringMap<any>,
  };

  const restParams = Object
    .keys(data)
    .forEach(key => {
      if (map.removals.hasOwnProperty(key)) {
        result.removals[key] = map.data[key];
      }
      else if (map.props.hasOwnProperty(key) === false) {
        result.rest[key] = map.data[key];
      }
    });

  return {
    props: map.props as T,
    rest: result.rest as Omit2<P, T, R>,
    removals: result.removals as R,
  };
}

export interface NamedObject {
  displayName?: string;
  typeName?: string;
  name?: string;

  constructor?: NamedObject;
}

export function getName(
  source: any,
  undefinedValue = 'undefined',
  isStatic = false,
): string {
  if (source == null) {
    return undefinedValue;
  }

  // first check if we're a string
  if (String.isString(source)) {
    return source;
  }

  // check if this is a function and try and extract the name directly
  if (source instanceof Function && String.isString(source.name)) {
    return source.name;
  }

  const nameSource: NamedObject = source;

  // now check the instance sources
  if (!String.isNullOrEmpty(nameSource.displayName)) {
    return nameSource.displayName;
  }

  if (!String.isNullOrEmpty(nameSource.typeName)) {
    return nameSource.typeName;
  }

  if (!String.isNullOrEmpty(nameSource.name)) {
    return nameSource.name;
  }

  // then check the static sources
  if (nameSource.constructor != null) {
    if (!String.isNullOrEmpty(nameSource.constructor.displayName)) {
      return nameSource.constructor.displayName;
    }

    if (!String.isNullOrEmpty(nameSource.constructor.typeName)) {
      return nameSource.constructor.typeName;
    }

    if (!String.isNullOrEmpty(nameSource.constructor.name)) {
      return nameSource.constructor.name;
    }
  }

  // try and extract the name from the toString() reprenstation
  // IE is pretty dumb and doesn't expose any useful naming properties
  // but this seems to work reliably for some objects
  if (nameSource.constructor != null) {
    const match = /function (.+)\(/.exec(nameSource.constructor.toString());
    if (match != null && match.length >= 2) {
      if (String.isNullOrEmpty(match[1]) === false) {
        return match[1];
      }
    }
  }

  // finally fallback onto simple toString()
  return nameSource.toString();
}

export interface EnumPropertyDescriptor<T> {
  name: string;
  value: number;
  type: T;
}

export function getEnumPropertyDescriptors<T>(type: any): Iterable<EnumPropertyDescriptor<T>> {
  return Object
    .keys(type)
    .asIterable()
    .map(name => ({ name, value: parseInt(type[name]) }))
    .filter(x => x.value >= 0)
    .map(x => Object.assign(x, { type: type[x.name] }));
}

export function getEnumNames<T>(type: any): string[] {
  return getEnumPropertyDescriptors<any>(type)
    .map(x => x.name)
    .toArray();
}

export function getEnumValues<T>(type: any): T[] {
  return getEnumPropertyDescriptors<T>(type)
    .map(x => x.type)
    .toArray();
}

/**
 * Get object property name
 * see: http://stackoverflow.com/questions/37048274/typescript-how-to-get-objects-property-name-from-its-value
 * @param {p: (x: T) => any} function which returns any object property
 * @returns {string} property name
 */
export function getPropName<T>(p: (x: T) => any): string {
  return (/\.([^\.;]+);?\s*\}$/.exec(p.toString()) || [])[1];
}

declare global {
  interface ObjectConstructor {
    isObject: typeof isObject;
    trim: typeof trim;
    rest: typeof rest;
    getName: typeof getName;
    getEnumPropertyDescriptors: typeof getEnumPropertyDescriptors;
    getEnumNames: typeof getEnumNames;
    getEnumValues: typeof getEnumValues;
    getPropName: typeof getPropName;
  }
}

Object.isObject = isObject;
Object.trim = trim;
Object.rest = rest;
Object.getName = getName;
Object.getEnumPropertyDescriptors = getEnumPropertyDescriptors;
Object.getEnumNames = getEnumNames;
Object.getEnumValues = getEnumValues;
Object.getPropName = getPropName;
