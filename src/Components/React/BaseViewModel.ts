'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import PubSub from '../../Utils/PubSub';
import Events from '../../Events';

export interface IBaseViewModel {
  initialize(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  private subscriptions: Rx.IDisposable[] = [];

  protected getDisplayName() { return Object.getName(this); }

  protected runOrAlert(action: () => void, header = 'Unknown Error', style = 'danger', formatter?: (e: Error) => string) {
    try {
      action();
    } catch (e) {
      let error = e as Error;
      let text: string;

      if (formatter != null) {
        text = formatter(error);
      } else {
        text = error.message;
      }

      if (e.stack) {
        console.log(e.stack);
      }

      this.createAlert(text, header, style);
    }
  }

  public initialize() {
  }

  public cleanup() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
  }

  protected createAlert(text: string, header?: string, style = 'info', timeout = 5000) {
    PubSub.publish(Events.AlertCreated, text, header, style, timeout);
  }

  public navTo(path: string, state?: Object, uriEncode = false) {
    PubSub.publish(Events.RouteChanged, path, state, uriEncode);
  }

  public bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>) {
    return this.subscribe(observable.invokeCommand(command));
  }

  protected subscribe(subscription: Rx.IDisposable) {
    this.subscriptions.push(subscription);
    return subscription;
  }
}

export default BaseViewModel;
