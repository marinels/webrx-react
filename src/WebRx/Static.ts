import { Observable } from 'rx';
import { isProperty, isCommand, isObservable, getObservable, getProperty } from './Utils';
import { property } from './Property';
import { command } from './Command';
import { whenAny } from './WhenAny';

export let wx = <WebRxStatic>{};
export interface WebRxStatic {
  isProperty: typeof isProperty;
  isCommand: typeof isCommand;
  isObservable: typeof isObservable;
  getObservable: typeof getObservable;
  getProperty: typeof getProperty;

  property: typeof property;
  command: typeof command;
  whenAny: typeof whenAny;
}

wx.isProperty = isProperty;
wx.isCommand = isCommand;
wx.isObservable = isObservable;
wx.getObservable = getObservable;
wx.getProperty = getProperty;

wx.property = property;
wx.command = command;
wx.whenAny = whenAny;
