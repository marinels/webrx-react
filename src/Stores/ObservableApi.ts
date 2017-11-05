import { Observable, Subject, Subscription, Observer, AjaxRequest } from 'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

import { wx, Property, Command } from '../WebRx';
import { Logger, getLogger } from '../Utils/Logging';
import { getWindowLocation, joinPath } from '../Routing';
import { HttpRequestMethod, SampleDataStore, SampleDataApi, SampleDataCreator, StoreApi } from './Interfaces';
import { getRequest } from './Helpers';

export class ObservableApi implements StoreApi {
  public static displayName = 'ObservableApi';

  protected readonly logger: Logger = getLogger(ObservableApi.displayName);
  protected readonly wx = wx;
  protected sampleData: SampleDataApi | undefined;

  public readonly path: string;
  public readonly base: string;
  public readonly baseUri: string;

  constructor(path: string, sampleData?: SampleDataCreator);
  constructor(path: string, base?: string, sampleData?: SampleDataCreator)
  constructor(path: string, baseOrSampleData?: string | SampleDataCreator, protected readonly sampleDataCreator?: SampleDataCreator) {
    const windowLocation = getWindowLocation() || <Location>{};

    if (baseOrSampleData instanceof Function) {
      this.sampleDataCreator = baseOrSampleData;
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

  public observe<T>(action: string, params?: any, data?: any, method?: HttpRequestMethod, options?: AjaxRequest, baseUri?: string) {
    const sampleData = this.getSampleData();

    return Observable
      .defer(() => {
        // use sampleData if it has been defined
        return sampleData == null ?
          getRequest<T>(action, this.getRequestUri(action, baseUri), this.logger, method, params, data, options) :
          sampleData.observe<T>(action, params);
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
