import * as wx from 'webrx';

import { getLogger } from '../Utils/Logging/LogManager';
import { HttpRequestMethod, ObservableApi } from './ObservableApi';

export class BaseModel<T> {
  constructor(model: T) {
    Object.assign(this, model);
  }
}

export abstract class BaseStore<T extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected logger = getLogger(BaseStore.displayName);

  constructor(public api: wx.Lazy<T>) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, method?: HttpRequestMethod, options?: wx.IHttpClientOptions, baseUri?: string) {
    return this.api.value
      .getObservable<T>(action, params, method, options, baseUri);
  }
}
