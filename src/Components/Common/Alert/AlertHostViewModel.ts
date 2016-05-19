import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';

import { Default as pubSub, ISubscriptionHandle } from '../../../Utils/PubSub';
import { AlertCreatedKey, IAlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;
  private alertCreatedHandle: ISubscriptionHandle;

  public alerts = wx.list<AlertViewModel>();

  private appendAlert(content: any, header?: string, style?: string, timeout?: number) {
    let alert = new AlertViewModel(this.alerts, ++this.currentAlertKey, content, header, style, timeout);

    this.alerts.add(alert);

    return alert;
  }

  initialize() {
    this.alertCreatedHandle = pubSub.subscribe<IAlertCreated>(AlertCreatedKey, x => this.appendAlert(x.content, x.header, x.style, x.timeout));
  }

  cleanup() {
    this.alertCreatedHandle = pubSub.unsubscribe(this.alertCreatedHandle);
  }
}
