import { Iterable } from 'ix';
import { AsyncIterableInput } from 'ix/asynciterable/asynciterablex';
import { Observable, Observer, Subscription } from 'rxjs';
import { PartialObserver } from 'rxjs/Observer';

export type IterableLike<T> = Iterable<T> | ArrayLike<T>;
export type AsyncIterableLike<T> = AsyncIterableInput<T>;
export type ObservableOrValue<T> = T | Observable<T>;
export type ObservableLike<T> = ObservableOrValue<T> | Property<T> | Command<T>;

export interface ReadOnlyProperty<T> {
  readonly changed: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  readonly isReadOnly: boolean;
  readonly value: T;

  isProperty(): boolean;
}

export interface Property<T> extends ReadOnlyProperty<T> {
  value: T;
}

export interface Command<T = any> {
  readonly isExecutingObservable: Observable<boolean>;
  readonly canExecuteObservable: Observable<boolean>;
  readonly requests: Observable<T>;
  readonly results: Observable<T>;
  readonly thrownErrors: Observable<Error>;
  readonly isExecuting: boolean;
  readonly canExecute: boolean;

  isCommand(): boolean;

  observeExecution(parameter?: any): Observable<T>;

  execute(
    parameter?: any,
    observer?: PartialObserver<T>,
  ): Subscription;

  execute(
    parameter?: any,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void,
  ): Subscription;
}
