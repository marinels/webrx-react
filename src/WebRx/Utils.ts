import { Observable, IObserver, Subject, helpers } from 'rx';

import { Property, Command, ObservableOrProperty } from './Interfaces';

export function isObservable(value: any | undefined): value is Observable<any> {
  return Observable.isObservable(value);
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

export function getObservable<T>(observableOrProperty: ObservableOrProperty<T> | undefined) {
  if (isProperty(observableOrProperty)) {
    return observableOrProperty.changed.startWith(observableOrProperty.value);
  }

  if (isObservable(observableOrProperty)) {
    return observableOrProperty;
  }

  throw new Error(`${ observableOrProperty } is neither observable property nor observable`);
}
