import { Observable } from  'rxjs';
import * as clone from 'clone';

import { SampleDataStore, SampleDataApi, SampleDataActionSet, SampleDataAction } from '../Interfaces';

export class ObservableSampleDataApi implements SampleDataApi {
  public static displayName = 'ObservableSampleDataApi';

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

  public observe<T>(action: string, params?: any) {
    return Observable
      .of(this.actions[action])
      .map(sampleDataAction => {
        if (sampleDataAction == null) {
          throw new Error(`Sample DataStore Action Not Found: ${ action }`);
        }

        return sampleDataAction;
      })
      .delay(this.delay)
      .flatMap<SampleDataAction, T>(sampleDataAction => {
        return sampleDataAction(params);
      });
  }

  public getStoreValue<T, TStore extends SampleDataStore>(name: string, selector: (store: TStore) => T) {
    const store = this.stores[name];

    if (store == null) {
      return undefined;
    }

    const value = selector(<TStore>store);

    return value == null ? undefined : clone(value);
  }
}
