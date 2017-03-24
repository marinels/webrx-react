import * as React from 'react';
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

  public createForError<TError>(error: TError, header?: string, style = 'danger', timeout?: number, formatter?: (e: TError) => any, logErrorObject = false) {
    if (error != null) {
      let content: any;
      let text: string | undefined;
      const anyError = error as any;
      const childError = anyError.error;

      if (formatter != null) {
        content = formatter(error);
        text = String.stringify(content);
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
        if (message == null && String.isString(anyError)) {
          message = anyError;
        }

        let messageDetail = anyError.messageDetail || anyError.MessageDetail;
        if (messageDetail == null && childError != null) {
          messageDetail = childError.messageDetail || childError.MessageDetail;
        }

        text = `${ String.isNullOrEmpty(code) ? '' : `Error ${ code }: ` }${ String.isNullOrEmpty(reason) ? '' : `(${ reason }): ` }${ message || String.stringify(error) }`;
        header = header || reason || 'Unknown Error';

        let uri = anyError.uri || anyError.Uri || anyError.url || anyError.Url;
        if (uri == null && childError != null) {
          uri = childError.uri || childError.Uri || childError.url || childError.Url;
        }

        content = (
          <div className='Alert-content'>
            <div className='Alert-title'>
            {
              // if there is a uri attached to the error then include it in the text
              String.isNullOrEmpty(code) ?
                null :
                (
                  <span className='Alert-code'>{ `Error ${ code }: ` }</span>
                )
            }
            {
              // if there is a uri attached to the error then include it in the text
              String.isNullOrEmpty(reason) ?
                null :
                (
                  <span className='Alert-code'>{ `${ reason }` }</span>
                )
            }
            </div>
            <div className='Alert-text'>
            {
              // if there is a uri attached to the error then include it in the text
              String.isNullOrEmpty(message) ?
                null :
                (
                  <div className='Alert-message'>{ message }</div>
                )
            }
            {
              // if there is a uri attached to the error then include it in the text
              String.isNullOrEmpty(messageDetail) ?
                null :
                (
                  <div className='Alert-messageDetail'>{ messageDetail }</div>
                )
            }
            </div>
            {
              // if there is a uri attached to the error then include it in the text
              String.isNullOrEmpty(uri) ?
                null :
                (
                  <div className='Alert-uri'>
                    <a href={ uri }>{ uri }</a>
                  </div>
                )
            }
          </div>
        );
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

      this.create(content, header, style, timeout);
    }
  }
}

export const Default = new Alert(PubSubInstance);

export function create(content: any, header?: string, style?: string, timeout?: number) {
  Default.create(content, header, style, timeout);
}

export function createForError<TError>(error: TError, header?: string, style?: string, timeout?: number, formatter?: (e: TError) => any) {
  Default.createForError(error, header, style, timeout, formatter);
}
