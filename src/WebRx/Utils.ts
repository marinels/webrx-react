import { Observable, IObserver, Subject, helpers } from 'rx';

import { Property, Command, ObservableOrProperty } from './Interfaces';

// this is a quick patch to prevent isObservable from detecting view models as
// observables due to the existence of a subscribe function.
function isViewModel(value: any | undefined) {
  return (
    value != null &&
    value.isViewModel instanceof Function &&
    value.isViewModel() === true
  );
}

export function isObservable(value: any | undefined): value is Observable<any> {
  return Observable.isObservable(value) && isViewModel(value) === false;
}

export function isObserver(value: any | undefined): value is IObserver<any> {
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

export function isSubject(value: any): value is Subject<any> {
  return isObservable(value) && isObserver(value);
}

export function asObservable<T>(value: T | Observable<T>) {
  return isObservable(value) ? value : Observable.of(value);
}

export function isProperty(value: any | undefined): value is Property<any> {
  if (value == null) {
    return false;
  }

  return isObservable((<Property<any>>value).changed);
}

export function isCommand(value: any | undefined): value is Command<any> {
  if (value == null) {
    return false;
  }

  return isObservable((<Command<any>>value).results);
}

export function getObservable<T>(observableOrProperty: ObservableOrProperty<T> | T | undefined) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty.changed.startWith(observableOrProperty.value);
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty;
  }

  if (observableOrProperty != null) {
    return Observable.of(observableOrProperty);
  }

  throw new Error(`Unable to convert '${ observableOrProperty }' to an observable`);
}

export function getProperty<T>(observableOrProperty: ObservableOrProperty<T> | T | undefined, initialValue?: T) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty;
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty.toProperty(initialValue);
  }

  if (initialValue == null && observableOrProperty != null) {
    initialValue = observableOrProperty;
  }

  if (initialValue != null) {
    // this is technically a immutable readonly property
    return Observable.never<T>().toProperty(initialValue);
  }

  throw new Error(`Unable to convert '${ observableOrProperty }' to a property`);
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
