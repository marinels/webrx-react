import { Subscription, AnonymousSubscription, TeardownLogic } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs';
import { IScheduler } from 'rxjs/Scheduler';
import { startWith } from 'rxjs/operator/startWith';

import { ReadOnlyProperty, Command } from './Interfaces';
import { isSubscription } from './Utils';
import { property } from './Property';

// we can disable shadowed variables here since we are performing type augmentations
// tslint:disable no-shadowed-variable

declare module 'rxjs/Subscription' {
  interface Subscription {
    addSubscription<T extends TeardownLogic>(subscription: T): T;
    addSubscriptions<T extends TeardownLogic>(...subscriptions: T[]): T[];
  }

  namespace Subscription {
    function unsubscribe<T>(subscription: T, unsubscribedValue?: T): T;
  }
}

function addSubscription<T extends TeardownLogic>(this: Subscription, subscription: T) {
  this.add(subscription);

  return subscription;
}
Subscription.prototype.addSubscription = addSubscription;

function addSubscriptions<T extends TeardownLogic>(this: Subscription, ...subscriptions: T[]) {
  return subscriptions
      .map(x => this.addSubscription(x));
}
Subscription.prototype.addSubscriptions = addSubscriptions;

function unsubscribe<T>(subscription: T, unsubscribedValue?: T): T {
  if (isSubscription(subscription)) {
    subscription.unsubscribe();

    return unsubscribedValue || <any>Subscription.EMPTY;
  }

  return subscription;
}
Subscription.unsubscribe = unsubscribe;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    filterNull<TFiltered>(this: Observable<TFiltered | undefined | null>, callbackfn?: (value: TFiltered, index: number) => boolean): Observable<TFiltered>;
    toProperty(initialValue?: T, compare?: boolean | ((x: T, y: T) => boolean), keySelector?: (x: T) => any): ReadOnlyProperty<T>;
    observeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>): Observable<TRet>;
    invokeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>, observer: Observer<T>): Subscription;
    invokeCommand<TRet>(command: ((parameter: T) => Command<TRet>) | Command<TRet>, onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void): Subscription;
  }
}

declare module 'rxjs/operator/startWith' {
  function startWith<T, TOther>(this: Observable<T>, value: TOther, scheduler?: IScheduler): Observable<T | TOther>;
  function startWith<T, TOther>(this: Observable<T>, ...array: Array<TOther | IScheduler>): Observable<T | TOther>;
}

function filterNull<T>(this: Observable<T | undefined | null>, callbackfn?: (value: T, index: number) => boolean): Observable<T> {
  return (<Observable<T>>this)
    .filter((x, i) => {
      if (x == null) {
        return false;
      }

      return callbackfn == null ? true : callbackfn(x, i);
    });
}
Observable.prototype.filterNull = filterNull;

function toProperty<T>(this: Observable<T>, initialValue?: T, compare?: boolean | ((x: T, y: T) => boolean), keySelector?: (x: T) => any) {
  return property(initialValue, compare, keySelector, this);
}
Observable.prototype.toProperty = toProperty;

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
Observable.prototype.observeCommand = observeCommand;

function invokeCommand<T, TRet>(
  this: Observable<T>,
  command: ((x: T) => Command<TRet>) | Command<TRet>,
  observerOrNext?: Observer<TRet> | ((value: TRet) => void),
  onError?: (exception: any) => void,
  onCompleted?: () => void,
): Subscription {
  const obs = this
    .observeCommand(command);

  return obs
    .subscribe.apply(obs, [ observerOrNext, onError, onCompleted ]);
}
Observable.prototype.invokeCommand = invokeCommand;
