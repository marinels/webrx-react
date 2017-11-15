import { Observable } from  'rxjs';
import * as clone from 'clone';

import { wx } from '../../WebRx';
import { Logger, getLogger } from '../../Utils/Logging';
import { SampleDataStore, SampleDataApi, SampleDataActionSet, SampleDataAction } from '../Interfaces';

export class ObservableSampleDataApi implements SampleDataApi {
  public static displayName = 'ObservableSampleDataApi';

  protected readonly logger: Logger = getLogger(ObservableSampleDataApi.displayName);

  protected readonly stores: StringMap<SampleDataStore>;
  protected readonly actions: SampleDataActionSet;
  protected readonly delay: number;

  constructor(...stores: Array<SampleDataStore>);
  constructor(delay: number, ...stores: Array<SampleDataStore>);
  constructor(arg1: number | SampleDataStore, ...stores: Array<SampleDataStore>) {
    this.stores = {};
    this.actions = {};

    if (Number.isNumber(arg1)) {
      this.delay = arg1;
    }
    else {
      this.delay = 0;
      stores.unshift(arg1);
    }

    stores
      .filterNull()
      .forEach(store => {
        this.addStore(store);
      });
  }

  protected addStore(store: SampleDataStore): void {
    Object.assign(this.actions, store.actions);

    this.stores[Object.getName(store)] = store;
  }

  public observe<T>(
    action: string,
    params?: any,
    cloneResult = true,
  ) {
    return Observable
      .of(this.actions[action])
      .map(sampleDataAction => {
        if (sampleDataAction == null) {
          throw new Error(`Sample DataStore Action Not Found: ${ action }`);
        }

        return sampleDataAction;
      })
      .do(() => {
        this.logger.info(`Sample API Request: ${ action }`, params);
      })
      .delay(this.delay)
      .flatMap<SampleDataAction, T>(sampleDataAction => {
        return Observable
          .defer(() => {
            return wx.asObservable(sampleDataAction(params));
          })
          .map(x => (x != null && cloneResult) ? clone(x) : x);
      })
      .do(
        x => {
          this.logger.info(`Sample API  Result: ${ action }`, x);
        },
        e => {
          this.logger.error(`Sample API  ERROR: ${ action }`, e);
        },
      );
  }

  public getStoreValue<T, TStore extends SampleDataStore>(
    name: string,
    selector: (store: TStore) => T,
    cloneResult = false,
  ) {
    const store = this.stores[name];

    if (store == null) {
      return undefined;
    }

    const value = selector(<TStore>store);

    return value == null ?
      undefined :
      (cloneResult ? clone(value) : value);
  }
}
