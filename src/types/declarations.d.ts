declare global {
  // a set of generic object map interfaces
  // typescript does not currently define these
  interface StringMap<T> {
    [key: string]: T;
  }

  interface NumberMap<T> {
    [key: number]: T;
  }

  // some type constructs to support type outersection (i.e., type subtraction)
  type Diff<T extends string, U1 extends string> = ({ [P in T]: P } &
    { [P in U1]: never } & { [x: string]: never })[T];

  type Diff2<T extends string, U1 extends string, U2 extends string> = ({
    [P in T]: P
  } &
    { [P in U1]: never } &
    { [P in U2]: never } & { [x: string]: never })[T];

  type Omit<T, TExclude> = Pick<T, Diff<keyof T, keyof TExclude>>;

  type Omit2<T, TExclude1, TExclude2> = Pick<
    T,
    Diff2<keyof T, keyof TExclude1, keyof TExclude2>
  >;
}

export {};
