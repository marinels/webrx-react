'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

interface IDashboardRoutingState {
  alertText: string;
}

export class DashboardViewModel extends BaseRoutableViewModel<IDashboardRoutingState> {
  public alertText = wx.property('');

  public generateAlert = wx.command(
    x => {
      this.createAlert(this.alertText(), moment().format(), 'info');
      this.routingStateChanged();
    },
    wx.whenAny(this.alertText, x => {
      return String.isNullOrEmpty(x) === false;
    })
  );

  public getRoutingState(context?: any) {
    return <IDashboardRoutingState>{
      alertText: this.alertText()
    };
  }

  public setRoutingState(state: IDashboardRoutingState) {
    // we must prime the command here because we need it to start observing
    // canExecute changes so that they are available to the view once it connects
    this.generateAlert.canExecute(null);

    this.alertText(Object.getValueOrDefault(state.alertText, ''));

    this.notifyChanged();
  }
}

export default DashboardViewModel;
