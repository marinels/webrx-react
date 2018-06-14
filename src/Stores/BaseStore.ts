// tslint:disable:max-classes-per-file

import { AjaxRequest, Observable, Subscription } from 'rxjs';

import { getLogger, Logger } from '../Utils/Logging';
import { WebRxStatic, wx } from '../WebRx';
import { isStoreApi } from './Helpers';
import { SampleDataCreator, StoreApi } from './Interfaces';
import { ObservableApi } from './ObservableApi';

export class BaseStore extends Subscription {
  public static displayName = 'BaseStore';

  protected readonly logger: Logger;
  protected readonly wx: WebRxStatic;
  protected readonly api: StoreApi;

  constructor(path: string, base?: string, sampleData?: SampleDataCreator, unsubscribe?: () => void);
  constructor(api: StoreApi, unsubscribe?: () => void);
  constructor(
    pathOrApi: string | StoreApi,
    baseOrUnsubscribe?: string | (() => void),
    sampleData?: SampleDataCreator,
    unsubscribe?: () => void,
  ) {
    unsubscribe = baseOrUnsubscribe instanceof Function ? baseOrUnsubscribe : unsubscribe;
    const base = String.isString(baseOrUnsubscribe) ? baseOrUnsubscribe : undefined;

    super(unsubscribe);

    this.logger = getLogger(BaseStore.displayName);
    this.wx = wx;

    if (isStoreApi(pathOrApi)) {
      this.api = pathOrApi;
    }
    else {
      this.api = new ObservableApi(pathOrApi, base, sampleData);
    }

    this.logger.name += ` (${ this.api.path })`;

    this.logger.debug('Store Created');
  }

  protected getObservable<T = any>(
    action: string,
    params?: any,
    options?: AjaxRequest,
    baseUri?: string,
  ): Observable<T> {
    return this.api
      .getObservable<T>(action, params, options, baseUri);
  }

  protected postObservable<T = any>(
    action: string,
    data?: any,
    params?: any,
    options?: AjaxRequest,
    baseUri?: string,
  ): Observable<T> {
    return this.api
      .postObservable<T>(action, data, params, options, baseUri);
  }
}

export class BaseApiStore<T extends StoreApi> extends BaseStore {
  constructor(protected readonly api: T, unsubscribe?: () => void) {
    super(api, unsubscribe);
  }
}
