import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';
import { Default as pubSub, SubscriptionHandle } from '../../../Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;
  private alertCreatedHandle: SubscriptionHandle;

  public alerts: wx.IObservableList<AlertViewModel>;

  constructor() {
    super();

    this.alerts = wx.list<AlertViewModel>();

    this.alertCreatedHandle = pubSub.subscribe<AlertCreated>(AlertCreatedKey, x => this.appendAlert(x.content, x.header, x.style, x.timeout));
  }

  private appendAlert(content: any, header?: string, style?: string, timeout?: number) {
    const alert = new AlertViewModel(++this.currentAlertKey, content, header, style, timeout);

    wx
      .whenAny(alert.isVisible, x => x)
      .filter(x => x === false)
      .take(1)
      .subscribe(x => {
        this.alerts.remove(alert);
      });

    this.alerts.add(alert);

    return alert;
  }

  dispose() {
    super.dispose();

    this.alertCreatedHandle = pubSub.unsubscribe(this.alertCreatedHandle);
  }
}
