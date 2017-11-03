import { Observable } from  'rxjs';
import * as clone from 'clone';

import { wx } from '../../WebRx';
import { BaseSampleDataStore, SampleDataActionSet, SampleDataAction } from './BaseSampleDataStore';

export class SampleData {
  protected readonly wx = wx;
  protected stores: StringMap<BaseSampleDataStore>;
  protected actions: SampleDataActionSet;
  protected readonly delay: number;

  constructor(...stores: Array<BaseSampleDataStore>);
  constructor(delay: number, ...stores: Array<BaseSampleDataStore>);
  constructor(arg1: number | BaseSampleDataStore, ...stores: Array<BaseSampleDataStore>) {
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

  protected addStore(store: BaseSampleDataStore): void {
    Object.assign(this.actions, store.actions);

    this.stores[Object.getName(store)] = store;
  }

  public getStoreValue<T, TStore extends BaseSampleDataStore>(name: string, selector: (store: TStore) => T) {
    const store = <TStore>this.stores[name];

    if (store == null) {
      return undefined;
    }

    const value = selector(store);

    return value == null ? undefined : clone(value);
  }

  public getObservable<T>(action: string, params?: any): Observable<T> {
    return Observable
      .of(this.actions[action])
      .delay(this.delay)
      .flatMap(sampleDataAction => {
        if (sampleDataAction == null) {
          return Observable.throw(new Error(`Sample DataStore Action Not Found: ${ action }`));
        }

        return sampleDataAction(params);
      });
  }
}
