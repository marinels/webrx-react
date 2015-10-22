'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { IRoutedViewModel } from '../React/BaseRoutableViewModel';
import { RouteManager, IRoute } from '../../Routing/RouteManager';
import { default as PubSub, ISubscriptionHandle } from '../../Utils/PubSub';
import Events from '../../Events';

export interface IViewModelActivator {
  (route?: IRoute): IRoutedViewModel;
}

export interface IRoutingMap {
  [path: string]: IViewModelActivator | string;
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

      this.manager.navTo(this.currentPath, state);
    }
  })

  private routingStateChangedHandle: ISubscriptionHandle;

  private updateRoute(route: IRoute) {
    if (route.path !== this.currentPath) {
      this.currentPath = route.path;

      let viewModel: IRoutedViewModel;
      let activator = this.routingMap[this.currentPath];

      if (activator == null) {
        activator = this.routingMap['*'];
      }

      if (activator != null) {
        if (activator instanceof Function) {
          if (RouteManager.EnableRouteDebugging) {
            console.log(String.format('Routing to Path: {0}', route.path));

            if (route.state != null) {
              console.log(JSON.stringify(route.state, null, 2));
            }
          }

          viewModel = (activator as IViewModelActivator)(route);
        } else {
          this.manager.navTo(activator.toString());
          return;
        }
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
    this.routingStateChangedHandle = PubSub.subscribe(Events.RoutingStateChanged, x => this.routingStateChanged.execute(x));

    this.subscribe(this.manager.routeChanged.results
      .where(x => x != null)
      .subscribe(x => this.runOrAlert(() => this.updateRoute(x), 'Route Changed Error'))
    );
  }

  public cleanup() {
    this.routingStateChangedHandle = PubSub.unsubscribe(this.routingStateChangedHandle);
  }
}

export default RouteHandlerViewModel;
