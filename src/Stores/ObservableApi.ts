import { AjaxRequest, Observable } from 'rxjs';

import { getWindowLocation, joinPath } from '../Routing';
import { getLogger, Logger } from '../Utils/Logging';
import { WebRxStatic, wx } from '../WebRx';
import { getRequest } from './Helpers';
import { HttpRequestMethod, SampleDataApi, SampleDataCreator, SampleDataStore, StoreApi } from './Interfaces';

export class ObservableApi implements StoreApi {
  public static displayName = 'ObservableApi';

  protected readonly logger: Logger;
  protected readonly wx: WebRxStatic;
  protected sampleData: SampleDataApi | undefined;
  protected sampleDataCreator: SampleDataCreator | undefined;

  public readonly path: string;
  public readonly base: string;
  public readonly baseUri: string;

  constructor(path: string, sampleData?: SampleDataCreator);
  constructor(path: string, base?: string, sampleData?: SampleDataCreator)
  constructor(path: string, baseOrSampleData?: string | SampleDataCreator, sampleDataCreator?: SampleDataCreator) {
    const windowLocation = getWindowLocation() || {} as Location;

    this.logger = getLogger(ObservableApi.displayName);
    this.wx = wx;

    if (WEBPACK_DEV_SERVER) {
      this.sampleDataCreator = sampleDataCreator;
    }

    if (baseOrSampleData instanceof Function) {
      if (WEBPACK_DEV_SERVER) {
        this.sampleDataCreator = baseOrSampleData;
      }
      baseOrSampleData = undefined;
    }

    if (String.isNullOrEmpty(baseOrSampleData)) {
      this.base = (windowLocation.origin || 'http://localhost') + (windowLocation.pathname || '/');
    }
    else {
      this.base = baseOrSampleData;
    }

    if (WEBPACK_DEV_SERVER) {
      this.path = joinPath(path, 'sample');
    }
    else {
      this.path = path;
    }

    this.logger.name += ` (${ this.path })`;

    this.baseUri = joinPath(this.path, this.base);
  }

  protected getSampleData() {
    if (this.sampleData == null && this.sampleDataCreator != null) {
      this.sampleData = this.sampleDataCreator();
    }

    return this.sampleData;
  }

  protected getRequestUri(action: string, baseUri: string | undefined) {
    return joinPath(action, baseUri || this.baseUri);
  }

  public observe<T>(
    action: string,
    params?: any,
    data?: any,
    method?: HttpRequestMethod,
    options?: AjaxRequest,
    baseUri?: string,
  ) {
    const sampleData = this.getSampleData();

    return Observable
      .defer(() => {
        // use sampleData if it has been defined
        return sampleData == null ?
          getRequest<T>(action, this.getRequestUri(action, baseUri), this.logger, method, params, data, options) :
          sampleData.observe<T>(action, params, data);
      });
  }

  public getObservable<T>(action: string, params?: any, options?: AjaxRequest, baseUri?: string) {
    return this.observe<T>(action, params, undefined, HttpRequestMethod.GET, options, baseUri);
  }

  public postObservable<T>(action: string, data?: any, params?: any, options?: AjaxRequest, baseUri?: string) {
    return this.observe<T>(action, params, data, HttpRequestMethod.POST, options, baseUri);
  }

  public getSampleStoreValue<T, TStore extends SampleDataStore>(name: string, selector: (data: TStore) => T) {
    if (this.sampleData == null) {
      return undefined;
    }

    return this.sampleData.getStoreValue(name, selector);
  }
}
