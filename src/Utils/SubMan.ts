'use strict';

import * as Rx from 'rx';

export class SubMan implements Rx.IDisposable {
  public static displayName = 'SubMan';

  private subscriptions: Rx.IDisposable[] = null;

  constructor(...subscriptions: Rx.IDisposable[]) {
    this.subscriptions = subscriptions;
  }

  public add(...subscriptions: Rx.IDisposable[]) {
    this.subscriptions.push(...subscriptions);
  }

  dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions = [];
  }
}

export default SubMan;
