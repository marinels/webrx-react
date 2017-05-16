import { Observable, DOM as rxdom } from 'rx-dom';

import {  } from '../WebRx';
import { Logging } from '../Utils';
import { ObservableApi } from './ObservableApi';

export abstract class BaseStore<T extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected readonly logger: Logging.Logger = Logging.getLogger(BaseStore.displayName);

  constructor(public api: T) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, options?: rxdom.AjaxSettings, baseUri?: string): Observable<T> {
    return this.api
      .getObservable<T>(action, params, options, baseUri);
  }

  protected postObservable<T>(action: string, data?: any, params?: any, options?: rxdom.AjaxSettings, baseUri?: string): Observable<T> {
    return this.api
      .postObservable<T>(action, data, params, options, baseUri);
  }
}
