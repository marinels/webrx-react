'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

interface IDashboardRoutingState {
}

export class DashboardViewModel extends BaseRoutableViewModel<IDashboardRoutingState> {
  public alertText = wx.property('');
  public generateAlert = wx.command(
    x => this.createAlert(this.alertText(), moment().format(), 'info'),
    this.alertText.changed
      .startWith(this.alertText())
      .select(x => String.isNullOrEmpty(x) == false)
  );

  public getRoutingState() {
    return <IDashboardRoutingState>{};
  }

  public setRoutingState(state: IDashboardRoutingState) {
  }
}

export default DashboardViewModel;
