/// <reference path="./Extensions.d.ts"/>

'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import './Object';

function invokeCommand<T, TResult>(command: wx.ICommand<TResult>) {
  return (this as Rx.Observable<T>)
    // debounce typings want the (incorrectly named) durationSelector to return a number here
    // either fix the typing file or do a .select(_ => 0) after the where to fix this
    .debounce(x => command.canExecuteObservable.startWith(command.canExecute(x)).where(b => b))
    .select(x => command.executeAsync(x).catch(Rx.Observable.empty<TResult>()))
    .switch()
    .subscribe();
}

let rxExtensions = (<any>Rx.Observable);
rxExtensions.prototype.invokeCommand = Object.getValueOrDefault(rxExtensions.prototype.invokeCommand, invokeCommand);
