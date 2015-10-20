/// <reference path="../typings/webrx/web.rx.d.ts" />

'use strict';

declare module Rx {
  export interface Observable<T> extends IObservable<T> {
    invokeCommand(command: wx.ICommand<any>): Rx.IDisposable;
  }
}

function invokeCommand<T, TResult>(command: wx.ICommand<TResult>) {
  // prime the command's canExecute (otherwise it will always return false when called in the observable stream)
  // this may be a scheduling problem? hard to tell.
  command.canExecute(null);
  return (this as Rx.Observable<T>)
    // debounce typings want the (incorrectly named) durationSelector to return a number here
    // either fix the typing file or do a .select(_ => 0) after the where to fix this
    .debounce(x => command.canExecuteObservable.startWith(command.canExecute(x)).where(b => b))
    .select(x => command.executeAsync(x).catch(Rx.Observable.empty<TResult>()))
    .switch()
    .subscribe();
}

(<any>Rx.Observable).prototype.invokeCommand = invokeCommand;
