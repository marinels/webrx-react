import * as Rx from 'rx';

import { BaseSampleDataStore, ISampleDataActionSet, ISampleDataAction } from './BaseSampleDataStore';

export class SampleData {
  protected actions: ISampleDataActionSet = {};

  constructor(protected delay = 0) {
  }

  public addDataStore(data: BaseSampleDataStore, name?: string): void {
    Object.assign(this.actions, data.getActions());

    if (String.isNullOrEmpty(name) === false) {
      (<any>this)[name] = data;
    }
  }

  public addAction(action: string, dataAction: ISampleDataAction) {
    this.actions[action] = dataAction;
  }

  getObservable<T>(action: string, params?: any) {
    let result: Rx.Observable<T> = null;
    let sampleDataAction = this.actions[action];

    if (sampleDataAction != null) {
      result = sampleDataAction(params)
        .delay(this.delay);
    }
    else {
      result = Rx.Observable.throw<T>(`Sample DataStore Action Not Found: ${action}`);
    }

    return result;
  }
}
