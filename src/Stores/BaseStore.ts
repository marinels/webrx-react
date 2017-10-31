import { Observable, AjaxRequest } from 'rxjs';

import { Logging } from '../Utils';
import { ObservableApi } from './ObservableApi';
import { SampleData } from './SampleData/SampleData';

export abstract class BaseStore {
  public static displayName = 'BaseStore';

  protected readonly logger: Logging.Logger = Logging.getLogger(BaseStore.displayName);
  protected readonly api: ObservableApi;

  constructor(path: string, base?: string, sampleData?: SampleData);
  constructor(api: ObservableApi);
  constructor(pathOrApi: string | ObservableApi, base?: string, sampleData?: SampleData) {
    if (pathOrApi instanceof ObservableApi) {
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
