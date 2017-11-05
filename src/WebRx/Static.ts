import {
  isIterable, isAsyncIterable,
  isSubscription, isObservable, isObserver, isSubject, isProperty, isCommand,
  asObservable, getObservable, getProperty, handleError, logError,
  logObservable, logMemberObservables,
  getObservableOrAlert, getObservableResultOrAlert, subscribeOrAlert,
} from './Utils';
import { property } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';

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
  return Object.assign<T>(target, wxStatic || wx);
}
