'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

interface IDashboardRoutingState {
  alertText: string;
}

export class DashboardViewModel extends BaseRoutableViewModel<IDashboardRoutingState> {
  public static displayName = 'DashboardViewModel';

  constructor(isRoutingEnabled = false) {
    super(isRoutingEnabled);
  }

  public alertText = wx.property('');

  public generateAlert = wx.command(
    x => {
      this.createAlert(this.alertText(), moment().format(), 'info');
    },
    wx.whenAny(this.alertText, x => {
      return String.isNullOrEmpty(x) === false;
    })
  );

  initialize() {
    this.subscribe(this.generateAlert.results
      .invokeCommand(this.routingStateChanged));
  }

  public getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      if (String.isNullOrEmpty(this.alertText()) === false) {
        state.alertText = this.alertText();
      }
    })
  }

  public setRoutingState(state: IDashboardRoutingState) {
    // because alertText is a two-way bound property, it doesn't generate notifications
    // so when setting routing state we must trigger the notification manually
    // we can do this by including it at the end of this function
    this.handleRoutingState(state, state => {
      this.alertText(state.alertText || '');
    }, this.alertText.changed);
  }
}

export default DashboardViewModel;
