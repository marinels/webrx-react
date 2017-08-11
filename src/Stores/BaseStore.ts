import { Observable, AjaxRequest } from 'rxjs';

import {  } from '../WebRx';
import { Logging } from '../Utils';
import { ObservableApi } from './ObservableApi';

export abstract class BaseStore<TApi extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected readonly logger: Logging.Logger = Logging.getLogger(BaseStore.displayName);

  constructor(public api: TApi) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, options?: AjaxRequest, baseUri?: string): Observable<T> {
    return this.api
      .getObservable<T>(action, params, options, baseUri);
  }

  protected postObservable<T>(action: string, data?: any, params?: any, options?: AjaxRequest, baseUri?: string): Observable<T> {
    return this.api
      .postObservable<T>(action, data, params, options, baseUri);
  }
}
