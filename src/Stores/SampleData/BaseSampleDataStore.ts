import * as Rx from 'rx';

import { Default as alert } from '../../Utils/Alert';

export interface ISampleDataAction {
  (params: any): Rx.Observable<any>;
}

export interface ISampleDataActionSet {
  [ action: string ]: ISampleDataAction;
}

export abstract class BaseSampleDataStore {
  public abstract getActions(): ISampleDataActionSet;

  protected connect(actions: ISampleDataActionSet, action: string, api: ISampleDataAction, thisArg: any = this) {
    actions[action] = function () {
      return api.apply(thisArg, arguments);
    };
  }

  protected createAlert(action: string, params: any = {}) {
    alert.create(JSON.stringify(params, null, 2), `SampleData API Call: ${action}`);
  }
}
