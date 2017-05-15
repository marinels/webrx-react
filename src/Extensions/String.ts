import './Object';

declare global {
  interface StringConstructor {
    isString(value: any): value is string;
    isNullOrEmpty(value: string | null | undefined): value is undefined;
    stringify(value: any, replacer?: any, space?: string | number): string | undefined;
  }
}

function isString(value: any): value is string {
  return typeof(value) === 'string' || value instanceof String;
}

function isNullOrEmpty(value: string | undefined): value is undefined {
  return value == null || value === '';
}

function stringify(value: any, replacer?: any, space: string | number = 2) {
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

String.isString = Object.fallback(String.isString, isString);
String.isNullOrEmpty = Object.fallback(String.isNullOrEmpty, isNullOrEmpty);
String.stringify = Object.fallback(String.stringify, stringify);
