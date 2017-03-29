import { Observable, IObserver, IDisposable } from 'rx';

import { Property, ReadOnlyProperty, Command } from './Interfaces';
import { isObserver, isCommand } from './Utils';
import { property, ObservableProperty } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';

declare module 'rx' {
  interface Observable<T> {
    subscribeWith(observerOrNext?: IObserver<T> | ((value: T) => void), onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;
    toProperty: (initialValue?: T) => ReadOnlyProperty<T>;
    observeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>): Observable<TRet>;
    invokeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>): IDisposable;
  }
}

function subscribeWith<T>(
  this: Observable<T>,
  observerOrNext?: IObserver<T> | ((value: T) => void),
  onError?: (exception: any) => void,
  onCompleted?: () => void,
) {
  if (isObserver(observerOrNext)) {
    return this
      .subscribe(observerOrNext);
  }

  return this
    .subscribe(observerOrNext, onError, onCompleted);
}
(<any>Observable).prototype.subscribeWith = subscribeWith;

function toProperty<T>(this: Observable<T>, initialValue?: T) {
  return property(initialValue, this);
}
(<any>Observable).prototype.toProperty = toProperty;

function observeCommand<T, TRet>(this: Observable<T>, command: ((x: T) => Command<TRet>) | Command<TRet>) {
  // see the ReactiveUI project for the inspiration behind this function:
  // https://github.com/reactiveui/ReactiveUI/blob/master/src/ReactiveUI/ReactiveCommand.cs#L1078
  return this
    .map(x => ({
      parameter: x,
      command: command instanceof Function ? command(x) : command,
    }))
    .debounce(x => {
      return x.command.canExecuteObservable
        // COMPAT -- canExecute is a function in Compat.ts
        .startWith(x.command.canExecute());
    })
    .map(x => {
      return x.command
        .observeExecution(x.parameter)
        .catch(Observable.empty<TRet>());
    })
    .switch();
}
(<any>Observable).prototype.observeCommand = observeCommand;

function invokeCommand<T, TRet>(
  this: Observable<T>,
  command: ((x: T) => Command<TRet>) | Command<TRet>,
  observerOrNext?: IObserver<TRet> | ((value: TRet) => void),
  onError?: (exception: any) => void,
  onCompleted?: () => void,
) {
  return this
    .observeCommand(command)
    .subscribeWith(observerOrNext, onError, onCompleted);
}
(<any>Observable).prototype.invokeCommand = invokeCommand;
