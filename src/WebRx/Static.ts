import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

import * as utils from '../Utils';
import { Logger } from '../Utils/Logging';
import { command } from './Command';
import { Command, Property } from './Interfaces';
import { property } from './Property';
import {
  asObservable, getObservable,
  getObservableOrAlert, getObservableResultOrAlert, getProperty, handleError, isAsyncIterable, isCommand,
  isIterable, isObservable, isObserver, isProperty, isSubject,
  isSubscription, logError,
  logMemberObservables, logObservable, subscribeOrAlert,
} from './Utils';
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

    utils,
  };
}

export const wx = create();

export type WebRxStatic = typeof wx;

export function inject<T extends {}>(target: T, wxStatic?: WebRxStatic) {
  return Object.assign(target, wxStatic || wx);
}
