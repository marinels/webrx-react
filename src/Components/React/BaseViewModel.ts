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

  initialize(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  public static displayName = 'BaseViewModel';

  private subscriptions: Rx.IDisposable[] = [];
  public stateChanged = wx.command();

  protected logger = logManager.getLogger(this.getDisplayName());

  protected getDisplayName() { return Object.getName(this); }

  protected createAlert(text: string, header?: string, style?: string, timeout?: number) {
    PubSub.publish<IAlertCreated>(AlertCreatedKey, { text, header, style, timeout });
  }

  protected alertForError(error: Error, header = 'Unknown Error', style = 'danger', formatter?: (e: Error) => string) {
    let text: string;

    if (formatter != null) {
      text = formatter(error);
    } else {
      text = error.message;
    }

    if (DEBUG) {
      let e = error as any;
      if (e.stack) {
        this.logger.error(e.stack.toString());
      }
    }

    this.createAlert(text, header, style);
  }

  protected runOrAlert(action: () => void, header = 'Unknown Error', style = 'danger', formatter?: (e: Error) => string) {
    try {
      action();
    } catch (e) {
      this.alertForError(e as Error);
    }
  }

  protected notifyChanged(...args: any[]) {
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
