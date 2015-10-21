'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { IRoutedViewModel } from '../React/BaseRoutableViewModel';
import { RouteManager, IRoute } from '../../Routing/RouteManager';

export interface IRoutingMap {
  [path: string]: (route?: IRoute) => IRoutedViewModel;
}

export class RouteHandlerViewModel extends BaseViewModel {
  constructor(public manager: RouteManager, public routingMap: IRoutingMap) {
    super();
  }

  private currentPath: string;
  public currentViewModel = wx.property<IRoutedViewModel>();
  public routingStateChanged = wx.command(x => {
    if (this.currentViewModel() != null) {
      let state = this.currentViewModel().getRoutingState();

      this.manager.NavTo(this.currentPath, state);
    }
  })

  private updateRoute(route: IRoute) {
    if (route.path !== this.currentPath) {
      this.currentPath = route.path;

      if (RouteManager.EnableRouteDebugging) {
        console.log(String.format('Routing to Path: {0}', route.path));

        if (route.state != null) {
          console.log(JSON.stringify(route.state, null, 2));
        }
      }

      let viewModel: IRoutedViewModel;
      let activator = this.routingMap[this.currentPath];

      if (activator == null) {
        activator = this.routingMap['*'];
      }

      if (activator != null) {
        viewModel = activator(route);
      }

      if (viewModel) {
        viewModel.setRoutingState(route.state);
      }

      this.currentViewModel(viewModel);
    } else if (this.currentViewModel()) {
      this.currentViewModel().setRoutingState(route.state);
    }
  }

  public initialize() {
    this.subscribe(this.manager.routeChanged.results
      .where(x => x != null)
      .subscribe(this.updateRoute)
    );
  }
}

export default RouteHandlerViewModel;
