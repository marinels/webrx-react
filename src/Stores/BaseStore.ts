import { Observable, Observer, Subject, Subscription, AjaxRequest } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

import { Logger, getLogger } from '../Utils/Logging';
import { wx, Property, Command } from '../WebRx';
import { SampleDataCreator, StoreApi } from './Interfaces';
import { isStoreApi } from './Helpers';
import { ObservableApi } from './ObservableApi';

export abstract class BaseStore {
  public static displayName = 'BaseStore';

  protected readonly logger: Logger = getLogger(BaseStore.displayName);
  protected readonly wx = wx;
  protected readonly api: StoreApi;

  constructor(path: string, base?: string, sampleData?: SampleDataCreator);
  constructor(api: StoreApi);
  constructor(pathOrApi: string | StoreApi, base?: string, sampleData?: SampleDataCreator) {
    if (isStoreApi(pathOrApi)) {
      this.api = pathOrApi;
    }
    else {
      this.api = new ObservableApi(pathOrApi, base, sampleData);
    }

    this.logger.name += ` (${ this.api.path })`;

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
