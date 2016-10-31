import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';
import { Default as pubSub, SubscriptionHandle } from '../../../Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;
  private alertCreatedHandle: SubscriptionHandle;

  public alerts = wx.list<AlertViewModel>();

  constructor() {
    super();

    this.alertCreatedHandle = pubSub.subscribe<AlertCreated>(AlertCreatedKey, x => this.appendAlert(x.content, x.header, x.style, x.timeout));
  }

  private appendAlert(content: any, header?: string, style?: string, timeout?: number) {
    let alert = new AlertViewModel(this.alerts, ++this.currentAlertKey, content, header, style, timeout);

    this.alerts.add(alert);

    return alert;
  }

  dispose() {
    super.dispose();

    this.alertCreatedHandle = pubSub.unsubscribe(this.alertCreatedHandle);
  }
}
