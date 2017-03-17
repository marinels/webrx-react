// tslint:disable:no-unused-variable

// webpack defines
declare global {
  const DEBUG: boolean;
  const PRODUCTION: boolean;
  const TEST: boolean;
  const WEBPACK_DEV_SERVER: boolean;
}

// a set of generic object map interfaces
// typescript does not currently define these
export interface StringMap<T> {
  [ key: string]: T;
};

export interface NumberMap<T> {
  [ key: number]: T;
};

export interface Map<T> extends StringMap<T>, NumberMap<T> {
}
