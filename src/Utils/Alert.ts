import * as wx from 'webrx';

import '../Extensions/String';
import { getLogger } from './Logging';
import { PubSub, Default as PubSubInstance } from './PubSub';
import { AlertCreatedKey, AlertCreated } from '../Events/AlertCreated';

export class Alert {
  private static displayName = 'Alert';

  private logger = new wx.Lazy(() => getLogger(Alert.displayName));

  constructor(private pubSub: PubSub) {
  }

  public create(content: any, header?: string, style?: string, timeout?: number) {
    if (String.isNullOrEmpty(content) === false || String.isNullOrEmpty(header) === false) {
      this.pubSub.publish<AlertCreated>(AlertCreatedKey, { content, header, style, timeout });
    }
  }

  public createForError<TError>(error: TError, header?: string, style = 'danger', timeout?: number, formatter?: (e: TError) => string, logErrorObject = false) {
    if (error != null) {
      let text: string;
      const anyError = error as any;
      const childError = anyError.error;

      if (formatter != null) {
        text = formatter(error);
      }
      else {
        let code = anyError.status || anyError.Status || anyError.code || anyError.Code;
        if (code == null && childError != null) {
          code = childError.status || childError.Status || childError.code || childError.Code;
        }

        let reason = anyError.reason || anyError.Reason;
        if (code == null && childError != null) {
          code = childError.reason || childError.Reason;
        }

        let message = anyError.message || anyError.Message;
        if (message == null && childError != null) {
          message = childError.message || childError.Message;
        }

        text = `Error ${ code || '' }${ String.isNullOrEmpty(reason) ? '' : ` (${ reason })` }: ${ message || String.stringify(error, null, 2) }`;
        header = header || reason || 'Unknown Error';
      }

      // allow build to override default value
      if (DEBUG) {
        logErrorObject = true;
      }

      if (logErrorObject === true) {
        this.logger.value.error(`${ header }: ${ text }`, error);
      }
      else {
        this.logger.value.error(`${ header }: ${ text }`);
      }

      this.create(text, header, style, timeout);
    }
  }
}

export const Default = new Alert(PubSubInstance);

export function create(content: any, header?: string, style?: string, timeout?: number) {
  Default.create(content, header, style, timeout);
}

export function createForError<TError>(error: TError, header = 'Unknown Error', style = 'danger', timeout?: number, formatter?: (e: TError) => string) {
  Default.createForError(error, header, style, timeout, formatter);
}
