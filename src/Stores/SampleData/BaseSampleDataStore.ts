'use strict';

import * as Rx from 'rx';

import Alerts from '../../Utils/Alerts';

export interface ISampleDataAction {
  (params: any): Rx.Observable<any>;
}

export interface ISampleDataActionSet {
  [ action: string ]: ISampleDataAction;
}

export abstract class BaseSampleDataStore {
  public abstract getActions(): ISampleDataActionSet;

  protected createAlert(action: string, params: any = {}) {
    Alerts.create(JSON.stringify(params, null, 2), `SampleData API Call: ${action}`);
  }
}

export default BaseSampleDataStore;
