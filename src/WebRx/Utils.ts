import { isIterable, isAsyncIterable } from 'ix/internal/isiterable';
import { AnonymousSubscription } from 'rxjs/Subscription';
import { Observable, Observer, Subject, Subscription } from 'rxjs';

import { Property, Command, IterableLike, AsyncIterableLike, ObservableOrValue, ObservableLike } from './Interfaces';
import { LogLevel } from '../Utils/Logging/LogLevel';
import { Default as ConsoleLogger } from '../Utils/Logging/Adapters/Console';

export { isIterable, isAsyncIterable };

export function isSubscription(value: any): value is AnonymousSubscription {
  if (value == null) {
    return false;
  }

  const sub: AnonymousSubscription = value;

  return sub.unsubscribe instanceof Function;
}

export function isObservable<T>(value: any): value is Observable<T> {
  return value instanceof Observable;
}

export function isObserver<T>(value: any): value is Observer<T> {
  if (value == null) {
    return false;
  }

  const obs: Observer<T> = value;

  return (
    obs.next instanceof Function &&
    obs.error instanceof Function &&
    obs.complete instanceof Function
  );
}

export function isSubject<T>(value: any): value is Subject<T> {
  return value instanceof Subject;
}

export function isProperty<T>(value: any): value is Property<T> {
  if (value == null) {
    return false;
  }

  const prop: Property<T> = value;

  return prop.isProperty instanceof Function && prop.isProperty();
}

export function isCommand<T>(value: any): value is Command<T> {
  if (value == null) {
    return false;
  }

  const cmd: Command<T> = value;

  return cmd.isCommand instanceof Function && cmd.isCommand();
}

export function asObservable<T>(value: ObservableOrValue<T>) {
  return isObservable(value) ? value : Observable.of(value);
}

export function getObservable<T>(
  observableLike: ObservableLike<T>,
) {
  if (isProperty(observableLike)) {
    return observableLike.changed.startWith(observableLike.value);
  }

  if (isCommand(observableLike)) {
    return observableLike.results;
  }

  if (isObservable(observableLike)) {
    return observableLike;
  }

  if (observableLike != null) {
    return Observable.of(observableLike);
  }

  return Observable.never<T>();
}

export function getProperty<T>(
  observableLike: ObservableLike<T>,
  initialValue?: T,
  compare?: boolean | ((x: T, y: T) => boolean),
  keySelector?: (x: T) => any,
) {
  if (isProperty(observableLike)) {
    return observableLike;
  }

  if (isCommand(observableLike)) {
    return observableLike.results.toProperty(initialValue);
  }

  if (isObservable(observableLike)) {
    return observableLike.toProperty(initialValue);
  }

  if (initialValue == null && observableLike != null) {
    initialValue = observableLike;
  }

  return new Subject<T>().toProperty(initialValue, compare, keySelector);
}

export function handleError(e: any, ...optionalParams: any[]) {
  let err: Error;

  if (e instanceof Error) {
    err = e;
  }
  else if (String.isString(e)) {
    err = new Error(e);
  }
  else if (String.isString(e.message) || String.isString(e.Message)) {
    err = new Error(e.message || e.Message);
  }
  else {
    err = new Error('Undefined Error');
  }

  // trim off the subject if it was provided with the optional params
  const subject = isSubject(optionalParams[0]) ?
    optionalParams.shift() :
    undefined;

  if (DEBUG || subject == null) {
    // in debug mode we want to emit any webrx errors
    // if there is no subject receiving the error then we should be emitting to the console
    logError(err, ...optionalParams);
  }

  if (isSubject<Error>(subject)) {
    subject.next(err);
  }
}

// replace this function to inject your own global error handling
export function logError(err: Error, ...optionalParams: any[]) {
  ConsoleLogger.logToConsole(LogLevel.Error, err, ...optionalParams);
}
