'use strict';

import PubSub from './PubSub';
import { AlertCreatedKey, IAlertCreated } from '../Events/AlertCreated';

export class Alert {
  public static create(content: any, header?: string, style?: string, timeout?: number) {
    PubSub.publish<IAlertCreated>(AlertCreatedKey, { content, header, style, timeout });
  }
}

export default Alert;
