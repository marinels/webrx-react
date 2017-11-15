import { Observable, Subject, Subscription, Observer } from  'rxjs';
import { AnonymousSubscription } from 'rxjs/Subscription';

import { wx } from '../../WebRx';
import { Alert } from '../../Utils';
import { Logger, getLogger } from '../../Utils/Logging';
import { SampleDataStore, SampleDataAction, SampleDataActionSet } from '../Interfaces';

export abstract class BaseSampleDataStore implements SampleDataStore {
  public static displayName = 'BaseSampleDataStore';

  protected readonly logger: Logger = getLogger(BaseSampleDataStore.displayName);
  protected readonly wx = wx;

  public readonly actions: SampleDataActionSet;

  constructor(protected readonly enableAlerts = false) {
    this.actions = {};
  }

  protected connect(action: string, api: SampleDataAction, thisArg: any = this) {
    this.actions[action] = function(params: any = {}) {
      this.createAlert(action, params);

      return api.apply(thisArg, arguments);
    }.bind(this);
  }

  protected createAlert(action: string, params: any = {}) {
    const message = `SampleData API Call: ${ action }`;

    if (this.enableAlerts) {
      Alert.create(JSON.stringify(params, null, 2), message);
    }
    else {
      this.logger.info(message, params);
    }
  }
}
