// tslint:disable:no-unused-variable

declare global {
  // webpack defines
  const DEBUG: boolean;
  const PRODUCTION: boolean;
  const TEST: boolean;
  const WEBPACK_DEV_SERVER: boolean;

  // a set of generic object map interfaces
  // typescript does not currently define these
  interface StringMap<T> {
    [ key: string]: T;
  }

  interface NumberMap<T> {
    [ key: number]: T;
  }
}

// since there are no exports, we must perform an empty export
export {};
