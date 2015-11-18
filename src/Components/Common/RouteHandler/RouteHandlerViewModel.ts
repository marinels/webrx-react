'use strict';

import * as Ix from 'ix';
import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';
import { IRoutedViewModel } from '../../React/BaseRoutableViewModel';
import { RouteManager, IRoute } from '../../../Routing/RouteManager';
import { default as PubSub, ISubscriptionHandle } from '../../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../../Events/RoutingStateChanged';

export interface IViewModelActivator {
  (route: IRoute): IRoutedViewModel;
}

export interface IRoutingMap {
  [path: string]: IViewModelActivator | string;
}

export class RouteHandlerViewModel extends BaseViewModel {
  public static displayName = 'RouteHandlerViewModel';

  constructor(public manager: RouteManager, public routingMap: IRoutingMap) {
    super();
  }

  private currentPath: string;

  public currentViewModel = this.manager.currentRoute.changed
    .select(x => this.getRoutedViewModel(x))
    .toProperty();

  private routingStateChangedHandle: ISubscriptionHandle;

  private getRoutedViewModel(route: IRoute): IRoutedViewModel {
    let viewModel = this.currentViewModel();

    if (route.path !== this.currentPath) {
      this.currentPath = route.path;

      let activator = this.routingMap[route.path];

      if (activator == null) {
        let result = Ix.Enumerable
          .fromArray(Object.keys(this.routingMap))
          .where(x => x != null && x.length > 0 && x[0] === '^')
          .select(x => ({ key: x, regex: new RegExp(x, 'i') }))
          .select(x => ({ key: x.key, match: x.regex.exec(route.path) }))
          .where(x => x.match != null)
          .select(x => ({ match: x.match, activator: this.routingMap[x.key] }))
          .firstOrDefault();

        if (result != null) {
          route.match = result.match;
          activator = result.activator;
        }
      }

      if (activator == null) {
        activator = this.routingMap['*'];
      }

      if (activator == null) {
        viewModel = null;
      } else {
        if (activator instanceof Function) {
          this.logger.debug('Routing to Path: {0}', route.path);

          if (route.state != null) {
            this.logger.debug(JSON.stringify(route.state, null, 2));
          }

          route.state.route = route;
          let result = (activator as IViewModelActivator).apply(this, [route]);
          if (typeof result !== typeof viewModel) {
            viewModel = result;
          }

          if (viewModel) {
            viewModel.setRoutingState(route.state);
          }
        } else {
          this.manager.navTo(activator.toString());
        }
      }
    } else if (viewModel) {
      this.logger.debug('Updating Routing State: {0}', route.path);

      if (route.state != null) {
        this.logger.debug(JSON.stringify(route.state, null, 2));
      }

      route.state = route.state || {};
      route.state.route = route;
      viewModel.setRoutingState(route.state);
    }

    return viewModel;
  }

  initialize() {
    super.initialize();

    this.routingStateChangedHandle = PubSub.subscribe<IRoutingStateChanged>(RoutingStateChangedKey, x => {
      if (this.currentViewModel() != null) {
        let state = this.currentViewModel().getRoutingState(x);

        this.manager.navTo(this.currentPath, state);
      }
    });
  }

  cleanup() {
    super.cleanup();

    this.routingStateChangedHandle = PubSub.unsubscribe(this.routingStateChangedHandle);
  }
}

export default RouteHandlerViewModel;
