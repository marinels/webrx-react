'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';
import AlertViewModel from '../Alert/AlertViewModel';

import { default as PubSub, ISubscriptionHandle } from '../../../Utils/PubSub';
import { AlertCreatedKey, IAlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;
  private alertCreatedHandle: ISubscriptionHandle;

  public alerts = wx.list<AlertViewModel>();

  private appendAlert(text: string, header?: string, style?: string, timeout?: number) {
    let alert = new AlertViewModel(this.alerts, ++this.currentAlertKey, text, header, style, timeout);

    this.alerts.add(alert);

    return alert;
  }

  initialize() {
    super.initialize();

    this.alertCreatedHandle = PubSub.subscribe<IAlertCreated>(AlertCreatedKey, x => this.appendAlert(x.text, x.header, x.style, x.timeout));
  }

  cleanup() {
    super.cleanup();

    this.alertCreatedHandle = PubSub.unsubscribe(this.alertCreatedHandle);
  }
}

export default AlertHostViewModel;
