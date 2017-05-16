import { Observable, IObserver, IDisposable } from 'rx';

import { ReadOnlyProperty, Command } from './Interfaces';
import { property } from './Property';

import 'rx';
declare module 'rx' {
  interface Observable<T> {
    startWith<TOther>(value: TOther): Observable<T | TOther>;
    filterNull<T>(this: Observable<T | undefined | null>): Observable<T>;
    toProperty: (initialValue?: T) => ReadOnlyProperty<T>;
    observeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>): Observable<TRet>;
    invokeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>, observer: IObserver<T>): IDisposable;
    invokeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>, onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): IDisposable;
  }
}

function filterNull<T>(this: Observable<T | undefined | null>) {
  return this
    .filter(x => x != null);
}
(<any>Observable).prototype.filterNull = filterNull;

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
        .startWith(x.command.canExecute)
        .filter(y => y);
    })
    .map(x => {
      return x.command
        .observeExecution(x.parameter);
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
): IDisposable {
  const obs = this
    .observeCommand(command);

  return obs
    .subscribe.apply(obs, [ observerOrNext, onError, onCompleted ]);
}
(<any>Observable).prototype.invokeCommand = invokeCommand;
