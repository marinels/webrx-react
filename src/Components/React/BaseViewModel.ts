'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import LogLevel from '../../Utils/Logging/LogLevel';
import logManager from '../App/Logging';
import PubSub from '../../Utils/PubSub';
import { AlertCreatedKey, IAlertCreated } from '../../Events/AlertCreated';
import { RouteChangedKey, IRouteChanged } from '../../Events/RouteChanged';

export interface IBaseViewModel {
  stateChanged: wx.ICommand<any>;

  getDisplayName(): string;
  createAlert(text: string, header?: string, style?: string, timeout?: number): void;
  alertForError(error: Error, header?: string, style?: string, formatter?: (e: Error) => string): void;
  subscribeOrAlert<T>(observable: () => Rx.Observable<T>, header: string, onNext?: (value: T) => void, onComplete?: () => void, errorFormatter?: (e: Error) => string): Rx.IDisposable;
  runOrAlert(action: () => void, header?: string, style?: string, formatter?: (e: Error) => string): void;
  notifyChanged(...args: any[]): void;

  initialize(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  public static displayName = 'BaseViewModel';

  private subscriptions: Rx.IDisposable[] = [];
  public stateChanged = wx.command();

  protected logger = logManager.getLogger(this.getDisplayName());

  public getDisplayName() { return Object.getName(this); }

  public createAlert(content: any, header?: string, style?: string, timeout?: number) {
    PubSub.publish<IAlertCreated>(AlertCreatedKey, { content, header, style, timeout });
  }

  public alertForError<TError>(error: TError, header = 'Unknown Error', style = 'danger', formatter?: (e: TError) => string) {
    if (error != null) {
      let text: string;
      let anyError = error as any;

      if (formatter != null) {
        text = formatter(error);
      } else if (String.isNullOrEmpty(anyError.message) === false) {
        text = anyError.message;
      } else {
        text = error.toString();
      }

      if (DEBUG) {
        if (anyError.stack) {
          this.logger.error(anyError.stack.toString());
        }
      }

      this.createAlert(text, header, style);
    }
  }

  public subscribeOrAlert<T, TError>(observable: () => Rx.Observable<T>, header: string, onNext?: (value: T) => void, onComplete?: () => void, errorFormatter?: (e: TError) => string) {
    try {
      return observable().subscribe(onNext, (error: TError) => {
        this.alertForError(error, header, undefined, errorFormatter);
      }, onComplete);
    } catch (e) {
      this.alertForError(e as Error);
    }
  }

  public runOrAlert(action: () => void, header = 'Unknown Error', style = 'danger', formatter?: (e: Error) => string) {
    try {
      action();
    } catch (e) {
      this.alertForError(e as Error);
    }
  }

  public notifyChanged(...args: any[]) {
    this.stateChanged.execute(args);
  }

  protected logObservable(observable: Rx.Observable<any>, name: string) {
    this.subscribe(observable.subscribe(x => {
      let value = x;
      if (x != null) {
        value = (typeof x === 'object') ? Object.getName(x, x.toString()) : x.toString();
      }
      this.logger.debug('{0} = {1}', name, value);
    }));
  }

  protected subscribe(subscription: Rx.IDisposable) {
    this.subscriptions.push(subscription);
    return subscription;
  }

  protected navTo(path: string, state?: Object, uriEncode = false) {
    PubSub.publish<IRouteChanged>(RouteChangedKey, { path, state, uriEncode });
  }

  public bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>) {
    return this.subscribe(observable.invokeCommand(command));
  }

  public initialize() {
    if (this.logger.level <= LogLevel.Debug) {
      let obj: { [key: string]: any } = this;
      let keys = Object.keys(obj);
      for (let i = 0; i < keys.length; ++i) {
        let member = obj[keys[i]];
        
        if (member != null) {
          let prop: { changed: Rx.Observable<any> } = member;
          let cmd: { results: Rx.Observable<any> } = member;
          
          if (prop.changed != null && prop.changed.subscribe instanceof Function) {
            this.logObservable(prop.changed, keys[i]);
          } else if (cmd.results != null && cmd.results.subscribe instanceof Function) {
            this.logObservable(cmd.results, String.format('<{0}>', keys[i]));
          }
        }
      }
    }
  }

  public cleanup() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
  }
}

export default BaseViewModel;
