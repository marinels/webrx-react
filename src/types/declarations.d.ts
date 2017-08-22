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

// import missing ix operators
import 'ix/types/add/iterable-operators/orderby';
