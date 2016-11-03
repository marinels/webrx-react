import * as wx from 'webrx';

import { Logging } from '../Utils';
import { HttpRequestMethod, ObservableApi } from './ObservableApi';

export abstract class BaseStore<T extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected logger = Logging.getLogger(BaseStore.displayName);

  constructor(public api: wx.Lazy<T>) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, method?: HttpRequestMethod, options?: wx.IHttpClientOptions, baseUri?: string) {
    return this.api.value
      .getObservable<T>(action, params, method, options, baseUri);
  }
}
