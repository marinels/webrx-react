'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import LogLevel from '../../Utils/Logging/LogLevel';
import { getLogger } from '../../Utils/Logging/LogManager';
import PubSub from '../../Utils/PubSub';
import SubMan from '../../Utils/SubMan';
import Alert from '../../Utils/Alert';
import { AlertCreatedKey, IAlertCreated } from '../../Events/AlertCreated';
import { RouteChangedKey, IRouteChanged } from '../../Events/RouteChanged';

export interface IBaseViewModel {
  stateChanged: wx.ICommand<any>;

  getDisplayName(): string;
  createAlert(text: string, header?: string, style?: string, timeout?: number): void;
  alertForError(error: Error, header?: string, style?: string, timeout?: number, formatter?: (e: Error) => string): void;
  subscribeOrAlert<T>(observable: () => Rx.Observable<T>, header: string, onNext?: (value: T) => void, onComplete?: () => void, style?: string, timeout?: number, errorFormatter?: (e: Error) => string): Rx.IDisposable;
  runOrAlert(action: () => void, header?: string, style?: string, timeout?: number, formatter?: (e: Error) => string): void;
  notifyChanged(...args: any[]): void;

  initialize(): void;
  loaded(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  public static displayName = 'BaseViewModel';

  private subs = new SubMan();
  public stateChanged = wx.command();

  protected logger = getLogger(this.getDisplayName());

  public getDisplayName() { return Object.getName(this); }

  public createAlert(content: any, header?: string, style?: string, timeout?: number) {
    Alert.create(content, header, style, timeout);
  }

  public alertForError<TError>(error: TError, header?: string, style?: string, timeout?: number, formatter?: (e: TError) => string) {
    Alert.createForError(error, header, style, timeout, formatter);
  }

  public subscribeOrAlert<T, TError>(observable: () => Rx.Observable<T>, header: string, onNext?: (value: T) => void, onComplete?: () => void, style?: string, timeout?: number, errorFormatter?: (e: TError) => string) {
    try {
      return observable().subscribe(onNext, (error: TError) => {
        this.alertForError(error, header, undefined, timeout, errorFormatter);
      }, onComplete);
    } catch (e) {
      this.alertForError(e, header, style, timeout, errorFormatter);
    }
  }

  public runOrAlert(action: () => void, header = 'Unknown Error', style?: string, timeout?: number, formatter?: (e: Error) => string) {
    try {
      action();
    } catch (e) {
      this.alertForError(e, header, style, timeout, formatter);
    }
  }

  public notifyChanged(...args: any[]) {
    this.stateChanged.execute(args);
  }

  private logMemberObservables() {
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
          this.logObservable(cmd.results, `<${keys[i]}>`);
        }
      }
    }
  }

  protected logObservable(observable: Rx.Observable<any>, name: string) {
    this.subscribe(observable.subscribe(x => {
      if (x instanceof Object) {
        let value = Object.getName(x);

        if (value === 'Object') {
          value = '';
        }

        this.logger.debug(`${name} = ${value}`, x);
      } else {
        this.logger.debug(`${name} = ${x}`);
      }
    }));
  }

  protected subscribe(subscription: Rx.IDisposable) {
    this.subs.add(subscription);
    return subscription;
  }

  protected navTo(path: string, state?: any, uriEncode = false) {
    PubSub.publish<IRouteChanged>(RouteChangedKey, { path, state, uriEncode });
  }

  public bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>) {
    return this.subscribe(observable.invokeCommand(command));
  }

  public initialize() {
    if (this.logger.level <= LogLevel.Debug) {
      this.logMemberObservables();
    }
  }

  public loaded() {}

  public cleanup() {
    this.subs.dispose();
  }
}

export default BaseViewModel;
