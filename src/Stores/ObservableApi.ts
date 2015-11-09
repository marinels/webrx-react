'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

export class ObservableApi {
  public static displayName = 'ObservableApi';
  public static EnableStoreApiDebugging = false;

  constructor(public baseUri: string) {
  }

  private client = wx.injector.get<wx.IHttpClient>(wx.res.httpClient);

  public getObservable<T>(action: string, params?: Object, options?: wx.IHttpClientOptions, baseUri?: string) {
    let uri = (baseUri || this.baseUri) + action;

    if (ObservableApi.EnableStoreApiDebugging) {
      console.log(String.format('Calling API: {0} ({1})', action, uri));
    }

    return Rx.Observable
      .fromPromise(this.client.get<T>(uri, params, options))
      .catch(x => {
        if (ObservableApi.EnableStoreApiDebugging) {
          console.log(String.format('API ERROR: {0} ({1})', action, uri));
          console.log(x);
        }

        return Rx.Observable.throw<T>(new Error(String.format('[{0}] {1}', x.status, x.response)));
      });
  }
}

export default ObservableApi;
