/// <reference path="./Extensions.d.ts"/>

'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import './Object';

function invokeCommand<T, TResult>(command: (x: T) => wx.ICommand<TResult> | wx.ICommand<TResult>) {
  return (this as Rx.Observable<T>)
    .select(x => ({
      parameter: x,
      command: (command instanceof Function ? command(x) : command) as wx.ICommand<TResult>
    }))
    .debounce(x => x.command.canExecuteObservable.startWith(x.command.canExecute(x.parameter)))
    .select(x => x.command.executeAsync(x.parameter).catch(Rx.Observable.empty<TResult>()))
    .switch()
    .subscribe();
}

let rxExtensions = (<any>Rx.Observable);
// rxExtensions.prototype.invokeCommand = Object.getValueOrDefault(rxExtensions.prototype.invokeCommand, invokeCommand);
// we need to override the built-in extension until it is patched
rxExtensions.prototype.invokeCommand = invokeCommand;
