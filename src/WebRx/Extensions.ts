// we can disable shadowed variables here since we are performing type augmentations
// tslint:disable no-shadowed-variable

import { Iterable } from 'ix';
import { Subscription, AnonymousSubscription, TeardownLogic } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { PartialObserver } from 'rxjs/Observer';
import { Observer } from 'rxjs';
import { IScheduler } from 'rxjs/Scheduler';
import { startWith } from 'rxjs/operator/startWith';

import { ReadOnlyProperty, Command, Property } from './Interfaces';
import { isSubscription } from './Utils';
import { property } from './Property';

export function filterNullIterable<TFiltered>(
  this: Iterable<TFiltered | undefined | null>,
  callbackfn?: (value: TFiltered, index: number) => boolean,
): Iterable<TFiltered> {
  return (<Iterable<TFiltered>>this)
    .filter((x, i) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i);
    });
}

export function addSubscription<T extends TeardownLogic>(this: Subscription, subscription: T): T {
  this.add(subscription);

  return subscription;
}

export function addSubscriptions<T extends TeardownLogic>(this: Subscription, ...subscriptions: T[]): Array<T> {
  return subscriptions
    .map(x => this.addSubscription(x));
}

export function unsubscribeStatic<T>(subscription: T, unsubscribedValue?: T): T {
  if (isSubscription(subscription)) {
    subscription.unsubscribe();

    return unsubscribedValue || <any>Subscription.EMPTY;
  }

  return subscription;
}

export function filterNullObservable<T>(
  this: Observable<T | undefined | null>,
  callbackfn?: (value: T, index: number) => boolean,
): Observable<T> {
  return (<Observable<T>>this)
    .filter((x, i) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i);
    });
}

export function toProperty<T>(
  this: Observable<T>,
  initialValue?: T,
  compare?: boolean | ((x: T, y: T) => boolean),
  keySelector?: (x: T) => any,
): Property<T> {
  return property(initialValue, compare, keySelector, this);
}

export function observeCommand<T, TRet>(
  this: Observable<T>,
  command: ((x: T) => Command<TRet>) | Command<TRet>,
): Observable<TRet> {
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

export function invokeCommand<T, TRet>(
  this: Observable<T>,
  command: ((parameter: T) => Command<TRet>) | Command<TRet>,
  observer: PartialObserver<T>,
): Subscription;
export function invokeCommand<T, TRet>(
  this: Observable<T>,
  command: ((parameter: T) => Command<TRet>) | Command<TRet>,
  next?: (value: T) => void,
  error?: (error: any) => void,
  complete?: () => void,
): Subscription;
export function invokeCommand<T, TRet>(
  this: Observable<T>,
  command: ((x: T) => Command<TRet>) | Command<TRet>,
  observerOrNext?: PartialObserver<TRet> | ((value: TRet) => void),
  error?: (error: any) => void,
  complete?: () => void,
): Subscription {
  const obs = this
    .observeCommand(command);

  return obs
    .subscribe.apply(obs, [ observerOrNext, error, complete ]);
}

declare module 'ix/iterable/iterablex' {
  interface IterableX<T> {
    filterNull: typeof filterNullIterable;
  }
}

declare module 'rxjs/Subscription' {
  interface Subscription {
    addSubscription: typeof addSubscription;
    addSubscriptions: typeof addSubscriptions;
  }

  namespace Subscription {
    let unsubscribe: typeof unsubscribeStatic;
  }
}

declare module 'rxjs/Observable' {
  interface Observable<T> {
    filterNull: typeof filterNullObservable;
    toProperty: typeof toProperty;
    observeCommand: typeof observeCommand;
    invokeCommand: typeof invokeCommand;
  }
}

// there is no new implementation for startWith, only additional typings
declare module 'rxjs/operator/startWith' {
  function startWith<T, TOther>(this: Observable<T>, value: TOther, scheduler?: IScheduler): Observable<T | TOther>;
  function startWith<T, TOther>(this: Observable<T>, ...array: Array<TOther | IScheduler>): Observable<T | TOther>;
}

Iterable.prototype.filterNull = filterNullIterable;
Subscription.prototype.addSubscription = addSubscription;
Subscription.prototype.addSubscriptions = addSubscriptions;
Subscription.unsubscribe = unsubscribeStatic;
Observable.prototype.filterNull = filterNullObservable;
Observable.prototype.toProperty = toProperty;
Observable.prototype.observeCommand = observeCommand;
Observable.prototype.invokeCommand = invokeCommand;
