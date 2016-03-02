'use strict';

import * as wx from 'webrx';

import logManager from '../Components/Common/App/Logging';
import ObservableApi from './ObservableApi';

export class BaseModel<T> {
  constructor(model: T) {
    Object.assign(this, model);
  }
}

export abstract class BaseStore<T extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected logger = logManager.getLogger(Object.getName(this));

  constructor(public api: wx.Lazy<T>) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, options?: wx.IHttpClientOptions, baseUri?: string) {
    return this.api.value
      .getObservable<T>(action, params, options, baseUri);
  }
}

export default BaseStore;
