'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import logManager from '../Components/App/Logging';

export class ObservableApi {
  public static displayName = 'ObservableApi';
  public static EnableStoreApiDebugging = false;

  protected logger = logManager.getLogger(Object.getName(this));

  constructor(public baseUri: string) {
  }

  private client = wx.injector.get<wx.IHttpClient>(wx.res.httpClient);

  public getObservable<T>(action: string, params?: Object, options?: wx.IHttpClientOptions, baseUri?: string) {
    let uri = (baseUri || this.baseUri) + action;

    if (ObservableApi.EnableStoreApiDebugging) {
      this.logger.debug('Calling API: {0} ({1})', action, uri);
    }

    return Rx.Observable
      .fromPromise(this.client.get<T>(uri, params, options))
      .catch(x => {
        if (ObservableApi.EnableStoreApiDebugging) {
          this.logger.error('API ERROR: {0} ({1})', action, uri);
          this.logger.error(x.toString());
        }

        let response = x.response.toString();
        if (String.isNullOrEmpty(response)) {
          response = 'No Response';
        }
        return Rx.Observable.throw<T>(new Error(String.format('[Error {0}] {1}', x.status, response)));
      });
  }
}

export default ObservableApi;
