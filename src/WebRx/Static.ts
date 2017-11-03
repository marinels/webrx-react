import {
  isIterable, isAsyncIterable,
  isSubscription, isObservable, isObserver, isSubject, isProperty, isCommand,
  asObservable, getObservable, getProperty, handleError, logError,
} from './Utils';
import { property } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';

export function create(target: {} = {}) {
  return {
    isIterable: isIterable,
    isAsyncIterable: isAsyncIterable,
    isSubscription: isSubscription,
    isObservable: isObservable,
    isObserver: isObserver,
    isSubject: isSubject,
    isProperty: isProperty,
    isCommand: isCommand,
    asObservable: asObservable,
    getObservable: getObservable,
    getProperty: getProperty,
    handleError: handleError,
    logError: logError,

    property: property,
    command: command,
    whenAny: whenAny,
  };
}

export const wx = create();

export type WebRxStatic = typeof wx;
