'use strict';

import * as Rx from 'rx';

import Alert from '../../Utils/Alert';

export interface ISampleDataAction {
  (params: any): Rx.Observable<any>;
}

export interface ISampleDataActionSet {
  [ action: string ]: ISampleDataAction;
}

export abstract class BaseSampleDataStore {
  public abstract getActions(): ISampleDataActionSet;

  protected createAlert(action: string, params: any = {}) {
    Alert.create(JSON.stringify(params, null, 2), `SampleData API Call: ${action}`);
  }
}

export default BaseSampleDataStore;
