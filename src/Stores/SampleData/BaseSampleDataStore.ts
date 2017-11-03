import { Observable } from  'rxjs';

import { wx } from '../../WebRx';
import { Alert } from '../../Utils';

export type SampleDataAction = (params: any) => Observable<any>;
export type SampleDataActionSet = StringMap<SampleDataAction>;

export abstract class BaseSampleDataStore {
  protected readonly wx = wx;

  public readonly actions: SampleDataActionSet;

  constructor(protected readonly enableAlerts = false) {
    this.actions = {};
  }

  protected connect(action: string, api: SampleDataAction, thisArg: any = this) {
    this.actions[action] = function(params: any = {}) {
      this.createAlert(action, params);

      return api.apply(thisArg, arguments);
    };
  }

  protected createAlert(action: string, params: any = {}) {
    if (this.enableAlerts === true) {
      Alert.create(JSON.stringify(params, null, 2), `SampleData API Call: ${ action }`);
    }
  }
}
