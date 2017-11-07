import { Observable, Observer, Subscription, Subject } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

import {
  isIterable, isAsyncIterable,
  isSubscription, isObservable, isObserver, isSubject, isProperty, isCommand,
  asObservable, getObservable, getProperty, handleError, logError,
  logObservable, logMemberObservables,
  getObservableOrAlert, getObservableResultOrAlert, subscribeOrAlert,
} from './Utils';
import { Property, Command } from './Interfaces';
import { property } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';
import { Logger } from '../Utils/Logging';

export function create() {
  return {
    isIterable,
    isAsyncIterable,
    isSubscription,
    isObservable,
    isObserver,
    isSubject,
    isProperty,
    isCommand,
    asObservable,
    getObservable,
    getProperty,
    handleError,
    logError,

    property,
    command,
    whenAny,

    logObservable,
    logMemberObservables,
    getObservableOrAlert,
    getObservableResultOrAlert,
    subscribeOrAlert,
  };
}

export const wx = create();

export type WebRxStatic = typeof wx;

export function inject<T extends {}>(target: T, wxStatic?: WebRxStatic) {
  return Object.assign(target, wxStatic || wx);
}
