'use strict';

import * as Rx from 'rx';

export interface IBaseViewModel extends Rx.IDisposable {
  initialize(): void;
  cleanup(): void;
}

export abstract class BaseViewModel implements IBaseViewModel {
  private subscriptions: Rx.IDisposable[] = [];

  public initialize() {
  }

  public cleanup() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
  }

  public subscribe(subscription: Rx.IDisposable) {
    this.subscriptions.push(subscription);
    return subscription;
  }

  public dispose() {
  }
}

export default BaseViewModel;
