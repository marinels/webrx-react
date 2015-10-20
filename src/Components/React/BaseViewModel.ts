'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import './Extensions';

export interface IBaseViewModel {
  initialize(): void;
  cleanup(): void;
  bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>): Rx.IDisposable;
}

export abstract class BaseViewModel implements IBaseViewModel {
  private subscriptions: Rx.IDisposable[] = [];

  public initialize() {
  }

  public cleanup() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
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
