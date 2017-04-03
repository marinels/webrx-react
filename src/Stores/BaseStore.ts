import { DOM as rxdom } from 'rx-dom';

import { wx } from '../WebRx';
import { Logging } from '../Utils';
import { HttpRequestMethod, ObservableApi } from './ObservableApi';

export abstract class BaseStore<T extends ObservableApi> {
  public static displayName = 'BaseStore';

  protected logger = Logging.getLogger(BaseStore.displayName);

  constructor(public api: T) {
    this.logger.debug('Store Created');
  }

  protected getObservable<T>(action: string, params?: any, options?: rxdom.AjaxSettings, baseUri?: string) {
    return this.api
      .getObservable<T>(action, params, options, baseUri);
  }

  protected postObservable<T>(action: string, data?: any, params?: any, options?: rxdom.AjaxSettings, baseUri?: string) {
    return this.api
      .postObservable<T>(action, data, params, options, baseUri);
  }
}
