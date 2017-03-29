import { Observable, IDisposable } from 'rx';

export interface ReadOnlyPropertyClass<T> {
  readonly changed: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  readonly isReadOnly: boolean;
  readonly value: T;
}

export interface ReadOnlyProperty<T> extends ReadOnlyPropertyClass<T> {
}

export interface PropertyClass<T> extends ReadOnlyPropertyClass<T> {
  value: T;
}

export interface Property<T> extends PropertyClass<T> {
}

export type ObservableOrProperty<T> = Observable<T> | Property<T>;

export interface Command<T> {
  readonly isExecutingObservable: Observable<boolean>;
  readonly canExecuteObservable: Observable<boolean>;
  readonly results: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  // COMPAT -- these members are redefined with different types in Compat.ts
  // readonly isExecuting: boolean;
  // readonly canExecute: boolean;

  observeExecution(parameter?: any): Observable<T>;
  execute(parameter?: any): IDisposable;
}
