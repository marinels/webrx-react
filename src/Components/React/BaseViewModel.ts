'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import PubSub from '../../Utils/PubSub';
import Events from '../../Events';

export interface IBaseViewModel {
  stateChanged: wx.ICommand<any>;

  initialize(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  public static EnablePropertyChangedDebugging = false;

  private subscriptions: Rx.IDisposable[] = [];
  public stateChanged = wx.command();

  protected getDisplayName() { return Object.getName(this); }

  protected createAlert(text: string, header?: string, style = 'info', timeout = 5000) {
    PubSub.publish(Events.AlertCreated, text, header, style, timeout);
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

  public initialize() {
  }

  public cleanup() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
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
