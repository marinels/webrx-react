import {
  isObservable, isObserver, isSubject, isProperty, isCommand, asObservable,
  getObservable, getProperty, handleError, logError,
} from './Utils';
import { property } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';

export let wx = <WebRxStatic>{};
export interface WebRxStatic {
  isObservable: typeof isObservable;
  isObserver: typeof isObserver;
  isSubject: typeof isSubject;
  isProperty: typeof isProperty;
  isCommand: typeof isCommand;
  asObservable: typeof asObservable;
  getObservable: typeof getObservable;
  getProperty: typeof getProperty;
  handleError: typeof handleError;
  logError: typeof logError;

  property: typeof property;
  command: typeof command;
  whenAny: typeof whenAny;
}

wx.isObservable = isObservable;
wx.isObserver = isObserver;
wx.isSubject = isSubject;
wx.isProperty = isProperty;
wx.isCommand = isCommand;
wx.asObservable = asObservable;
wx.getObservable = getObservable;
wx.getProperty = getProperty;
wx.handleError = handleError;
wx.logError = logError;

wx.property = property;
wx.command = command;
wx.whenAny = whenAny;
