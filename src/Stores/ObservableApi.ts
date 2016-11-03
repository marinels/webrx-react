import { Observable } from  'rx';
import * as wx from 'webrx';

import { Logging } from '../Utils';
import { SampleData } from './SampleData/SampleData';

export enum HttpRequestMethod {
  GET,
  POST,
}

export class ObservableApi {
  public static displayName = 'ObservableApi';

  private logger = Logging.getLogger(ObservableApi.displayName);
  private client = wx.injector.get<wx.IHttpClient>(wx.res.httpClient);
  protected sampleData: SampleData = null;

  constructor(public baseUri: string) {
  }

  private getNonNullParams(params?: any) {
    if (params == null) {
      return null;
    }

    for (const key in params) {
      if (params[key] == null) {
        delete params[key];
      }
    }

    return params;
  }

  public getObservable<T>(action: string, params?: any, method: HttpRequestMethod = HttpRequestMethod.GET, options?: wx.IHttpClientOptions, baseUri?: string) {
    const uri = `${baseUri || this.baseUri}${action}`;

    params = this.getNonNullParams(params);

    this.logger.info(`Calling API: ${action} (${uri})`, params);

    return this.sampleData == null ?
      // if an API call throws an uncaught error, that means you are not subscribing to the observable's error
      Observable
        .fromPromise(method === HttpRequestMethod.POST ? this.client.post<T>(uri, params, options) : this.client.get<T>(uri, params, options))
        .do(x => {
          this.logger.info(`API Result: ${action} (${uri})`, x);
        })
        .catch(x => {
          this.logger.error(`API ERROR: ${action} (${uri})`, x);

          let error: any = null;

          try {
            error = JSON.parse(x.response);
          }
          catch (e) {
            this.logger.error('Unable to Get Error Response', e);

            error = 'Unknown Error: Invalid Response from API Host';
          }

          return Observable.throw<T>(error);
        }) :
        // if sample data has been created just use that instead (opt-in)
        this.sampleData.getObservable<T>(action, params);
  }

    public getSampleData(name: string, selector: (data: any) => any) {
      const sampleData = (<any>this.sampleData || {})[name];
      return sampleData == null ? null : Object.assign<any>({}, selector(sampleData));
    }
}
