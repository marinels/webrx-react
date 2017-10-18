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

  // some type constructs to support type outersection (i.e., type subtraction)
  type Diff<T extends string, U extends string> = (
    & { [ P in T ]: P }
    & { [ P in U ]: never }
    & { [ x: string ]: never }
  )[T];

  type Omit<T, TExclude> = Pick<T, Diff<keyof T, keyof TExclude>>;
}

export {};
