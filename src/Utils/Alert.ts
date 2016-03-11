'use strict';

import { PubSub, default as PubSubInstance } from './PubSub';
import { AlertCreatedKey, IAlertCreated } from '../Events/AlertCreated';

export class Alert {
  constructor(private pubSub: PubSub) {
  }

  public create(content: any, header?: string, style?: string, timeout?: number) {
    this.pubSub.publish<IAlertCreated>(AlertCreatedKey, { content, header, style, timeout });
  }
}

export default new Alert(PubSubInstance);
