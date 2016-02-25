/// <reference path="../rx/rx.all.d.ts" />
/// <reference path="../../node_modules/webrx/dist/web.rx.d.ts" />

declare module Rx {
    export interface Observable<T> extends IObservable<T> {
        invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
        invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
    }
}

declare module 'webrx' {
  export = wx;
}
