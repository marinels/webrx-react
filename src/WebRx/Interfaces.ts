import { Observable, IObserver, IDisposable } from 'rx';

export interface ReadOnlyProperty<T> {
  readonly changed: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  readonly isReadOnly: boolean;
  readonly value: T;
}

export interface Property<T> extends ReadOnlyProperty<T> {
  value: T;
}

export type ObservableOrProperty<T> = Observable<T> | Property<T>;
export type OOP<T> = ObservableOrProperty<T>;
export type ObservableOrPropertyOrValue<T> = ObservableOrProperty<T> | T;
export type OOPOV<T> = ObservableOrPropertyOrValue<T>;

export interface Command<T> {
  readonly isExecutingObservable: Observable<boolean>;
  readonly canExecuteObservable: Observable<boolean>;
  readonly results: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  readonly isExecuting: boolean;
  readonly canExecute: boolean;

  observeExecution(parameter?: any): Observable<T>;

  execute(
    parameter?: any,
    observerOrNext?: IObserver<T>,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ): IDisposable;

  execute(
    parameter?: any,
    onNext?: (value: T) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ): IDisposable;
}
