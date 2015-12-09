'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';
import { IRoute } from '../../Routing/RouteManager';

interface IDashboardRoutingState {
  alertText: string;

  // this will allow us to process the actual route information (like additional
  // path elements for our header property)
  route: IRoute;
}

export class DashboardViewModel extends BaseRoutableViewModel<IDashboardRoutingState> {
  public static displayName = 'DashboardViewModel';

  public header = wx.property('');

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
    super.initialize();

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
      // we can extra route path elements by using the route.match
      // which contains the regex match groups for the regex definde in the routing map
      this.header(String.isNullOrEmpty(state.route.match[2]) ? 'WebRx.React' : state.route.match[2]);
      this.alertText(state.alertText || '');
    }, this.alertText.changed);
  }
}

export default DashboardViewModel;
