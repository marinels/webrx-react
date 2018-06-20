import { Alert } from '../../Utils';
import { getLogger, Logger } from '../../Utils/Logging';
import { WebRxStatic, wx } from '../../WebRx';
import {
  SampleDataAction,
  SampleDataActionSet,
  SampleDataStore,
} from '../Interfaces';

export abstract class BaseSampleDataStore implements SampleDataStore {
  public static displayName = 'BaseSampleDataStore';

  protected readonly logger: Logger;
  protected readonly wx: WebRxStatic;

  public readonly actions: SampleDataActionSet;

  constructor(protected readonly enableAlerts = false) {
    this.actions = {};
    this.logger = getLogger(BaseSampleDataStore.displayName);
    this.wx = wx;
  }

  protected connect(
    action: string,
    api: SampleDataAction,
    thisArg: any = this,
  ) {
    this.actions[action] = function(params: any = {}) {
      this.createAlert(action, params);

      return api.apply(thisArg, arguments);
    }.bind(this);
  }

  protected createAlert(action: string, params: any = {}) {
    if (this.enableAlerts) {
      Alert.create(
        JSON.stringify(params, null, 2),
        `SampleDataStore API Call: ${action}`,
      );
    }
  }
}
