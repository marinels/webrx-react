'use strict';

import * as wx from 'webrx';

import { getLogger } from './Logging/LogManager';
import { PubSub, default as PubSubInstance } from './PubSub';
import { AlertCreatedKey, IAlertCreated } from '../Events/AlertCreated';

export class Alert {
  private static displayName = 'Alert';

  private logger = new wx.Lazy(() => getLogger(Alert.displayName));

  constructor(private pubSub: PubSub) {
  }

  public create(content: any, header?: string, style?: string, timeout?: number) {
    if (String.isNullOrEmpty(content) === false || String.isNullOrEmpty(header) === false) {
      this.pubSub.publish<IAlertCreated>(AlertCreatedKey, { content, header, style, timeout });
    }
  }

  public createForError<TError>(error: TError, header = 'Unknown Error', style = 'danger', timeout?: number, formatter?: (e: TError) => string) {
    if (error != null) {
      let text: string;

      if (formatter != null) {
        text = formatter(error);
      } else {
        let anyError = error as any;
        let childError = anyError.error;

        let code = anyError.status || anyError.Status || anyError.code || anyError.Code;
        if (code == null && childError != null) {
          code = childError.status || childError.Status || childError.code || childError.Code;
        }

        let message = anyError.message || anyError.Message;
        if (message == null && childError != null) {
          message = childError.message || childError.Message;
        }

        text = `Error ${code || ''}: ${message || String.stringify(error, null, 2)}`;

        if (DEBUG) {
          let stack = anyError.stack || anyError.stacktrace || anyError.stackTrace || anyError.StackTrace;
          if (stack == null && childError != null) {
            stack = childError.stack || childError.stacktrace || childError.stackTrace || childError.StackTrace;
          }

          if (stack != null) {
            this.logger.value.error(`${header}: ${message}`, error);
          }
        }
      }

      this.create(text, header, style, timeout);
    }
  }
}

export default new Alert(PubSubInstance);
