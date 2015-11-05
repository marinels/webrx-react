'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

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
  public static EnableViewModelDebugging = false;

  private subscriptions: Rx.IDisposable[] = [];
  public stateChanged = wx.command();

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

    let e = error as any;
    if (e.stack) {
      console.log(e.stack);
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
      console.log(String.format('[ViewModel] {0}.{1} Property Changed ({2})', this.getDisplayName(), name, value))
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
    if (BaseViewModel.EnableViewModelDebugging) {
      let obj: { [key: string]: any } = this;
      let keys = Object.keys(obj);
      for (let i = 0; i < keys.length; ++i) {
        let prop: { changed: Rx.Observable<any> } = obj[keys[i]];
        if (prop != null && prop.changed != null) {
          this.logObservable(prop.changed, keys[i]);
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
