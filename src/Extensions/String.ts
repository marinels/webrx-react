import './Object';

declare global {
  interface StringConstructor {
    isString(value: any): value is string;
    isNullOrEmpty(value: string): boolean;
    stringify(value: any, replacer?: any, space?: string | number): string;
  }
}

function isString(value: any): value is string {
  return typeof(value) === 'string' || value instanceof String;
}

function isNullOrEmpty(value: string) {
  return value == null || value === '';
}

function stringify(value: any, replacer?: any, space: string | number = 2) {
  let result: string = null;

  if (value != null) {
    result = value.toString();

    if (result === '[object Object]') {
      result = Object.getName(value);

      if (result === 'Object') {
        try {
          result = JSON.stringify(value, replacer, space);
        }
        catch (e) {
          // console.warn('Attempt to stringify failed');
          // console.log(e);
        }
      }
    }
  }

  return result;
}

String.isString = Object.fallback(String.isString, isString);
String.isNullOrEmpty = Object.fallback(String.isNullOrEmpty, isNullOrEmpty);
String.stringify = Object.fallback(String.stringify, stringify);
