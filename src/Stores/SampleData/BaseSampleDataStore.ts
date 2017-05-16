import { Observable } from  'rx';

import { Default as alert } from '../../Utils/Alert';

export interface SampleDataAction {
  (params: any): Observable<any>;
}

export interface SampleDataActionSet {
  [ action: string ]: SampleDataAction;
}

export abstract class BaseSampleDataStore {
  public abstract getActions(): SampleDataActionSet;

  constructor(protected readonly enableAlerts = false) {
  }

  protected connect(actions: SampleDataActionSet, action: string, api: SampleDataAction, thisArg: any = this) {
    actions[action] = function () {
      return api.apply(thisArg, arguments);
    };
  }

  protected createAlert(action: string, params: any = {}) {
    if (this.enableAlerts === true) {
      alert.create(JSON.stringify(params, null, 2), `SampleData API Call: ${ action }`);
    }
  }
}
