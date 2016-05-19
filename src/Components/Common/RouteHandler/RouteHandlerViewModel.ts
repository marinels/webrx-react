import * as Ix from 'ix';

import { IRoutedViewModel } from '../../React/BaseRoutableViewModel';
import { BaseViewModel } from '../../React/BaseViewModel';
import { RouteManager, IRoute } from '../../../Routing/RouteManager';
import { Default as pubSub, ISubscriptionHandle } from '../../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../../Events/RoutingStateChanged';

export interface IViewModelActivator {
  path?: string;
  creator?: (route: IRoute) => IRoutedViewModel;
}

export interface IRoutingMap {
  [path: string]: IViewModelActivator;
}

export class RouteHandlerViewModel extends BaseViewModel {
  public static displayName = 'RouteHandlerViewModel';

  private currentPath: string;

  public currentViewModel = this.manager.currentRoute.changed
    .select(x => this.getRoutedViewModel(x))
    .doOnNext(x => {
      if (x != null) {
        document.title = x.getTitle();
      }
    })
    .toProperty();

  public isLoading = this.currentViewModel.changed
    .select(x => false)
    .take(1)
    .startWith(true)
    .toProperty();

  private routingStateChangedHandle: ISubscriptionHandle;

  constructor(public manager: RouteManager, public routingMap: IRoutingMap) {
    super();
  }

  private getRoutedViewModel(route: IRoute) {
    // by default we set the view model to the current routed view model
    // if our route is for a new view model we will override it there
    let viewModel: IRoutedViewModel = this.currentViewModel();

    // get the activator for the requested route
    let activator = this.getActivator(route);

    if (activator == null) {
      // if the activator is null then we just return null for the routed view model
      viewModel = null;
    } else {
      if (activator.path != null && activator.creator == null) {
        // this is a simple redirect route
        this.logger.debug(`Redirecting from ${route.path} to ${activator.path}`);

        // only redirect to a different path
        this.manager.navTo(activator.path);
      } else {
        // this is a routed view model path
        if ((activator.path || route.path) === this.currentPath) {
          // we're on the same path (or virtual path)
          this.logger.debug(`Routing to Same Path: (${activator.path} || ${route.path}) == ${this.currentPath}`);

          // we can just update the current routed component's state
          this.updateRoutingState(route);
        } else {
          // a new routing path is requested
          this.logger.debug(`Routing to Path: ${route.path}`);

          // update the current path (use the virtual path if specified, otherwise the routing path)
          this.currentPath = activator.path == null ? route.path : activator.path;

          // create the routed view model
          viewModel = activator.creator(route);

          // now set the routing state on the new routed view model
          this.updateRoutingState(route, viewModel);
        }
      }
    }

    return viewModel;
  }

  private updateRoutingState(route: IRoute, viewModel?: IRoutedViewModel) {
    viewModel = viewModel || this.currentViewModel();

    if (viewModel != null) {
      this.logger.debug(`Updating Routing State: ${route.path}`);

      if (route.state != null) {
        this.logger.debug(JSON.stringify(route.state, null, 2));
      }

      // initialize the routing state to default as an empty object
      route.state = route.state || {};
      // assing the route in the state (so the routed view model can access route properties)
      route.state.route = route;

      // start the routing state assignment
      viewModel.setRoutingState(route.state);
    }
  }

  private getActivator(route: IRoute) {
    // default by just fetching the mapped route directly
    let activator = this.routingMap[route.path];

    // if there is no directly mapped route, check for a parameterized route
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
        // if we found a parameterized route then set the match properties on the route
        route.match = result.match;

        activator = result.activator;
      }
    }

    // if we found no matching route, then use the default route
    if (activator == null) {
      activator = this.routingMap['*'];
    }

    return activator;
  }

  initialize() {
    this.subscribe(this.currentViewModel.thrownExceptions
      .subscribe(x => {
        this.alertForError(x);
      })
    );

    this.routingStateChangedHandle = pubSub.subscribe<IRoutingStateChanged>(RoutingStateChangedKey, x => {
      if (this.currentViewModel() != null) {
        let state = this.currentViewModel().getRoutingState(x);

        this.manager.navTo(this.currentPath, state);
      }
    });
  }

  cleanup() {
    this.routingStateChangedHandle = pubSub.unsubscribe(this.routingStateChangedHandle);
  }
}
