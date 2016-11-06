/// <reference path="../../../typings/main/ambient/rx/index.d.ts" />
/// <reference path="../../../typings/main/ambient/web.rx/index.d.ts" />

declare namespace Rx {
    export interface Observable<T> extends IObservable<T> {
        // the invokeCommand Rx extensions aren't currently published so we'll add them here for now
        invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
        invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
    }
}

// WebRx doesn't expose a default export, so we'll do it here
declare module 'webrx' {
  export = wx;
}
