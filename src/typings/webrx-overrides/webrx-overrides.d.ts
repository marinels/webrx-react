/// <reference path="../../../typings/main/ambient/rx/rx.d.ts" />
/// <reference path="../../../typings/main/ambient/web.rx/web.rx.d.ts" />

declare namespace Rx {
    export interface Observable<T> extends IObservable<T> {
        invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
        invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
    }
}

declare module 'webrx' {
  export = wx;
}
