'use strict';

import * as Rx from 'rx';
import * as Ix from 'ix';

import { BaseSampleDataStore, ISampleDataActionSet, ISampleDataAction } from './BaseSampleDataStore';
import Alert from '../../Utils/Alert';

export class SampleData {
  protected actions: ISampleDataActionSet = {};

  constructor(protected delay = 0) {
  }

  public addDataStore(data: BaseSampleDataStore): void {
    Object.assign(this.actions, data.getActions());
  }

  public addAction(action: string, dataAction: ISampleDataAction) {
    this.actions[action] = dataAction;
  }

  getObservable<T>(action: string, params?: any) {
    let result: Rx.Observable<T> = null;
    let sampleDataAction = this.actions[action];

    if (sampleDataAction != null) {
      result = sampleDataAction(params);
    } else {
      Alert.create(action, 'Sample DataStore Action Not Found', 'warning');

      result = Rx.Observable.never<T>();
    }

    return result
      .delay(this.delay);
  }
}

export default SampleData;
