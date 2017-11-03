declare global {
  // webpack defines
  const DEBUG: boolean;
  const PRODUCTION: boolean;
  const TEST: boolean;
  const WEBPACK_DEV_SERVER: boolean;
  const VERSION: string;

  // a set of generic object map interfaces
  // typescript does not currently define these
  interface StringMap<T> {
    [ key: string]: T;
  }

  interface NumberMap<T> {
    [ key: number]: T;
  }

  // some type constructs to support type outersection (i.e., type subtraction)
  type Diff<T extends string, U extends string> = (
    & { [ P in T ]: P }
    & { [ P in U ]: never }
    & { [ x: string ]: never }
  )[T];

  type Omit<T, TExclude> = Pick<T, Diff<keyof T, keyof TExclude>>;

  // temporary patch to deal with Array.prototype.fill
  // used by ixjs
  interface Array<T> {
    fill(value: T, start?: number, end?: number): this;
  }
  interface ObjectConstructor {
    setPrototypeOf(o: any, proto: object | null): any;
  }
}

export {};
