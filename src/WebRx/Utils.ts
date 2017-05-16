import { Observable, IObserver, Subject, helpers } from 'rx';

import { Property, Command, ObservableOrPropertyOrValue } from './Interfaces';

export function isObservable<T>(value: any | undefined): value is Observable<T> {
  return Observable.isObservable(value);
}

export function isObserver<T>(value: any | undefined): value is IObserver<T> {
  if (value == null) {
    return false;
  }

  const obs = <IObserver<any>>value;

  return (
    helpers.isFunction(obs.onNext) &&
    helpers.isFunction(obs.onError) &&
    helpers.isFunction(obs.onCompleted)
  );
}

export function isSubject<T>(value: any): value is Subject<T> {
  return isObservable(value) && isObserver(value);
}

export function asObservable<T>(value: T | Observable<T>) {
  return isObservable(value) ? value : Observable.of(value);
}

export function isProperty<T>(value: any | undefined): value is Property<T> {
  if (value == null) {
    return false;
  }

  return isObservable((<Property<T>>value).changed);
}

export function isCommand<T>(value: any | undefined): value is Command<T> {
  if (value == null) {
    return false;
  }

  return isObservable((<Command<any>>value).results);
}

export function getObservable<T>(observableOrProperty: ObservableOrPropertyOrValue<T>) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty.changed.startWith(observableOrProperty.value);
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty;
  }

  if (observableOrProperty != null) {
    return Observable.of(observableOrProperty);
  }

  return Observable.never<T>();
}

export function getProperty<T>(observableOrProperty: ObservableOrPropertyOrValue<T>, initialValue?: T) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty;
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty.toProperty(initialValue);
  }

  if (initialValue == null && observableOrProperty != null) {
    initialValue = observableOrProperty;
  }

  return Observable.never<T>().toProperty(initialValue);
}

export function handleError(e: any, subject: Subject<Error>) {
  const err = e instanceof Error ? e : new Error(e);

  if (DEBUG) {
    // in debug mode we want to emit any webrx errors
    // tslint:disable-next-line:no-console
    console.error(err);
  }

  subject.onNext(err);
}
