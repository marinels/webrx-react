/// <reference path="../../typings/rx/rx.all.d.ts" />

declare interface ObjectConstructor {
  assign<T>(target: any, ...sources: any[]): T;
  dispose<T>(disposable: T, returnNull?: boolean): T;
  getName(source: any, undefined?: string): string;
  getValueOrDefault<T>(value: T, defaultValue: T): T;
}

declare interface StringConstructor {
  isNullOrEmpty(value: string): boolean;
  stringify(value: any, replacer?: any, space?: string | number): string;
  format(format: string, ...args: any[]): string;
}

declare module Rx {
  export interface Observable<T> extends IObservable<T> {
    invokeCommand<TResult>(command: wx.ICommand<TResult>): Rx.IDisposable;
    invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): Rx.IDisposable;
  }
}

// this allows us to fetch the name of a function without requiring any casting
// this is an ES6 standard, but is typically available on most browsers
// of course IE does not support it, but that just means it will be null when
// referencing as long as there is an expectation that this value might be null
// we can continue to define this extension
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name
interface Function {
  name: string;
}

declare module wx {
  interface IObservableProperty<T> {
    thrownExceptions?: Rx.Observable<T>;
  }
}
