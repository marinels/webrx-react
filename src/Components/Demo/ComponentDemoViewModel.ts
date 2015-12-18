'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import { IRoute } from '../../Routing/RouteManager';
import { IMenu } from '../Common/PageHeader/Actions';

import BaseViewModel from '../React/BaseViewModel';
import BaseRoutableViewModel from '../React/BaseRoutableViewModel';
import { default as RoutingMap, IViewModelActivator } from './RoutingMap';

export class ComponentDemoViewModel extends BaseRoutableViewModel<any> {
  public static displayName = 'ComponentDemoViewModel';

  constructor() {
    super(true);
  }

  public columns = wx.property(12);
  public component = wx.property<BaseViewModel>(null);

  getAppMenus() {
    return [
      { id: 'demos', header: 'Component Demos', items: RoutingMap.menuItems }
    ];
  }

  private getComponentName(state: { route: IRoute }) {
    return (state != null && String.isNullOrEmpty(state.route.match[2]) == false) ?
      state.route.match[2] : null;
  }

  private getViewModel(componentName: string, state: any) {
    let activator: IViewModelActivator = null;

    if (componentName != null) {
      this.logger.debug('Loading View Model for "{0}"...', componentName);
      activator = RoutingMap.map[componentName];
    }

    return activator == null ? null : activator(state);
  }

  getRoutingState(context?: any): any {
    // we don't actually produce state in this view model
    return null;
  }

  setRoutingState(state: any) {
    let componentName = this.getComponentName(state);

    if (componentName == null) {
      this.navTo(RoutingMap.getUri(RoutingMap.getRoutablePaths().shift()));
    } else {
      this.handleRoutingState(state, state => {
        this.component(this.getViewModel(componentName, state));
      });
    }
  }
}

export default ComponentDemoViewModel;
