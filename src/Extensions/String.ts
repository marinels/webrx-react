export function isString(value: any): value is string {
  return typeof(value) === 'string' || value instanceof String;
}

export function isNullOrEmpty(value: string | undefined): value is undefined {
  return value == null || value === '';
}

export function stringify(value: any, replacer?: any, space: string | number = 2): string | undefined {
  let result: string | undefined;

  if (value != null) {
    result = value.toString();

    if (result === '[object Object]') {
      result = Object.getName(value);

      if (result === 'Object') {
        try {
          result = JSON.stringify(value, replacer, space);
        }
        catch (e) {
          // do nothing and result will retain the getName value
        }
      }
    }
  }

  return result;
}

declare global {
  interface StringConstructor {
    isString: typeof isString;
    isNullOrEmpty: typeof isNullOrEmpty;
    stringify: typeof stringify;
  }
}

String.isString = isString;
String.isNullOrEmpty = isNullOrEmpty;
String.stringify = stringify;
