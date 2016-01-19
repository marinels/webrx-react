'use strict';

import * as Rx from 'rx';
import * as Ix from 'ix';
import * as wx from 'webrx';

import { IRoute } from '../../Routing/RouteManager';
import { IMenu } from '../Common/PageHeader/Actions';

import { BaseRoutableViewModel, IRoutedViewModel } from '../React/BaseRoutableViewModel';
import { default as RoutingMap, IViewModelActivator } from './RoutingMap';

interface IComponentDemoRoutingState {
  route: IRoute;
  componentName: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<IComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  constructor() {
    super(true);
  }

  private componentName: string;

  public columns = wx.property(12);
  public component = wx.property<any>(null);

  getAppMenus() {
    return [
      { id: 'demos', header: 'Component Demos', items: RoutingMap.menuItems }
    ];
  }

  private getViewModel(componentName: string, state: any) {
    let activator: IViewModelActivator = null;

    if (componentName != null) {
      this.logger.debug('Loading View Model for "{0}"...', componentName);
      activator = RoutingMap.map[componentName];

      if (activator == null) {
        let result = Ix.Enumerable
          .fromArray(Object.keys(RoutingMap.map))
          .where(x => x != null && x.length > 0 && x[0] === '^')
          .select(x => ({ path: x, regex: new RegExp(x, 'i') }))
          .select(x => ({ path: x.path, match: x.regex.exec(componentName) }))
          .where(x => x.match != null)
          .select(x => ({ match: x.match, activator: RoutingMap.map[x.path] }))
          .firstOrDefault();

        if (result != null) {
          activator = result.activator;

          // override the routed state's match with the demo's context
          state.route.match = result.match;
        }
      }
    }

    return activator == null ? null : activator(state);
  }

  initialize() {
    this.subscribe(wx
      .whenAny(this.columns.changed, x => null)
      .invokeCommand(this.routingStateChanged)
    );
  }

  getRoutingState(context?: any): any {
    return this.createRoutingState(state => {
      state.route = <IRoute>{
        path: String.format('demo/{0}', this.componentName)
      };

      if (this.columns() !== 12) {
        state.columns = this.columns();
      }
    });
  }

  setRoutingState(state: IComponentDemoRoutingState) {
    this.componentName = state.componentName || state.route.match[2];

    if (this.componentName == null) {
      if (RoutingMap.menuItems.length > 0) {
        this.navTo(RoutingMap.menuItems[0].uri);
      }
    } else {
      this.handleRoutingState(state, state => {
        this.columns(state.columns || 12);

        let component = this.getViewModel(this.componentName, state) as IRoutedViewModel;

        if (component.setRoutingState) {
          component.setRoutingState(state);
        }

        this.component(component);
      });
    }
  }
}

export default ComponentDemoViewModel;
