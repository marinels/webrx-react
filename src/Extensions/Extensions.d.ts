declare interface ObjectConstructor {
  assign<T>(target: any, ...sources: any[]): T;
  dispose<T>(disposable: T, returnNull?: boolean): T;
  getName(source: any, undefinedValue?: string): string;
  getValueOrDefault<T>(value: T, defaultValue: T): T;
}

declare interface StringConstructor {
  isNullOrEmpty(value: string): boolean;
  stringify(value: any, replacer?: any, space?: string | number): string;
}
