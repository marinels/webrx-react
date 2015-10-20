/// <reference path="../typings/rx/rx.all.d.ts" />

declare interface ObjectConstructor {
  assign(target: Object, ...sources: Object[]): Object;
  dispose<T>(disposable: T, returnNull?: boolean): T;
  getName(source: any, undefined?: string): string;
  getValueOrDefault<T>(value: T, defaultValue: T): T;
}

declare interface StringConstructor {
  isNullOrEmpty(value: string): boolean;
  format(format: string, ...args: any[]): string;
}

declare module Rx {
  export interface Observable<T> extends IObservable<T> {
    invokeCommand(command: wx.ICommand<any>): Rx.IDisposable;
  }
}
