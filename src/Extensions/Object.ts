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

export function assign<T>(target: any, ...sources: any[]): T {
  if (target == null) {
    target = {};
  }

  return sources
    .filter(x => x != null)
    .reduce(
      (to, source) => {
        Object
          .keys(source)
          // .filter(key => Object.prototype.hasOwnProperty.call(source, key))
          .forEach(key => {
            to[key] = source[key];
          });

        return to;
      },
      target,
    );
}

export interface RestResult<TProps, TRest> {
  props: TProps;
  rest: TRest;
}

// this extension solves the Unknown Prop Warning that is experienced in
// typescript when using Rest and Spread Properties
// see: https://facebook.github.io/react/warnings/unknown-prop.html
// see: https://facebook.github.io/react/docs/transferring-props.html
export function rest<TProps, TRest extends StringMap<any>>(
  data: TRest, propsCreator?: (x: TRest) => TProps,
  ...omits: string[],
): RestResult<TProps, TRest> {
  const props = propsCreator == null ? <TProps>{} : propsCreator(data);

  const restParams = Object
    .keys(data)
    .filter(key => props.hasOwnProperty(key) === false && omits.indexOf(key) < 0)
    .reduce(
      (r, key) => {
        r[key] = data[key];

        return r;
      },
      <TRest>{},
    );

  return { props, rest: restParams };
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
  if (source != null) {
    const nameSource: NamedObject = source;

    if (String.isString(nameSource)) {
      return nameSource;
    }
    else if (!String.isNullOrEmpty(nameSource.displayName)) {
      return nameSource.displayName;
    }
    else if (!String.isNullOrEmpty(nameSource.typeName)) {
      return nameSource.typeName;
    }
    else if (!String.isNullOrEmpty(nameSource.name)) {
      return nameSource.name;
    }
    else if (nameSource.constructor != null) {
      // this allows us to inspect the static properties of the source object
      // but we don't want to go beyond the the static properties
      if (isStatic === false) {
        const name = getName(nameSource.constructor, undefinedValue, true);

        if (String.isNullOrEmpty(name) === false) {
          return name;
        }
      }
      else {
        // IE is pretty dumb and doesn't expose any useful naming properties
        // so we can try and extract it from the toString()
        let match = /function (.+)\(/.exec(nameSource.toString());
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

export function getEnumNames<T>(type: any): Array<string> {
  return getEnumPropertyDescriptors<any>(type)
    .map(x => x.name)
    .toArray();
}

export function getEnumValues<T>(type: any): Array<T> {
  return getEnumPropertyDescriptors<T>(type)
    .map(x => x.type)
    .toArray();
}

/**
 *  Get object property name: http://stackoverflow.com/questions/37048274/typescript-how-to-get-objects-property-name-from-its-value
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
