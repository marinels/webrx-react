declare namespace Rx {
    export interface Observable<T> extends IObservable<T> {
        invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
        invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
    }
}

declare module 'webrx' {
  export = wx;
}
