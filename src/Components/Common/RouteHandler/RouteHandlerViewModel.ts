import { Enumerable } from 'ix';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { Manager, Route } from '../../../Routing/RouteManager';
import { RouteMapper } from '../../../Routing/RoutingMap';
import { PubSub } from '../../../Utils';
import { RoutingStateChangedKey, RoutingStateChanged } from '../../../Events/RoutingStateChanged';

export class RouteHandlerViewModel extends BaseViewModel {
  public static displayName = 'RouteHandlerViewModel';

  private currentPath: string;

  public currentViewModel: wx.IObservableReadOnlyProperty<any>;
  public isLoading: wx.IObservableReadOnlyProperty<boolean>;

  constructor(public routingMap: RouteMapper) {
    super();

    this.currentViewModel = wx
      .whenAny(Manager.currentRoute, x => x)
      .filter(x => x != null)
      .map(x => this.getRoutedViewModel(x))
      .doOnNext(x => {
        if (x != null) {
          document.title = x.getTitle();
        }

        const vm = this.currentViewModel();
        if (vm != null && vm !== x && vm.dispose instanceof Function) {
          vm.dispose();
        }
      })
      .toProperty();

    this.isLoading = wx
      .whenAny(this.currentViewModel, x => x == null)
      .filter(x => x === false)
      .take(1)
      .toProperty(true);

    this.subscribe(this.currentViewModel.thrownExceptions
      .subscribe(x => {
        const name = x == null ? '' : ` ${ Object.getName(x) }`;

        this.alertForError(x, `Error Routing to ViewModel ${ name }`);
      })
    );

    this.subscribe(
      PubSub.subscribe<RoutingStateChanged>(RoutingStateChangedKey, x => {
        if (this.currentViewModel() != null) {
          Manager.navTo(this.currentPath, this.currentViewModel().getRoutingState(x));
        }
      })
    );
  }

  private getRoutedViewModel(route: Route) {
    // by default we set the view model to the current routed view model
    // if our route is for a new view model we will override it there
    let viewModel: BaseRoutableViewModel<any> = this.currentViewModel();

    // get the activator for the requested route
    let activator = this.getActivator(route);

    if (activator == null) {
      // if the activator is null then we don't have a valid path or view model
      // we need to clear the currentPath so that back nav works properly
      this.currentPath = null;

      // then just return null for the routed view model
      viewModel = null;
    }
    else {
      if (activator.path != null && activator.creator == null) {
        // this is a simple redirect route
        this.logger.debug(`Redirecting from ${ route.path } to ${ activator.path }`);

        // only redirect to a different path
        Manager.navTo(activator.path);
      }
      else {
        // this is a routed view model path
        if ((activator.path || route.path) === this.currentPath) {
          // we're on the same path (or virtual path)
          this.logger.debug(`Routing to Same Path: (${ activator.path } || ${ route.path }) == ${ this.currentPath }`);

          // we can just update the current routed component's state
          this.updateRoutingState(route);
        }
        else {
          // a new routing path is requested
          this.logger.debug(`Routing to Path: ${ route.path }`);

          // update the current path (use the virtual path if specified, otherwise the routing path)
          this.currentPath = activator.path == null ? route.path : activator.path;

          // create the routed view model
          viewModel = activator.creator<BaseRoutableViewModel<any>>(route);

          // now set the routing state on the new routed view model
          this.updateRoutingState(route, viewModel);
        }
      }
    }

    return viewModel;
  }

  private updateRoutingState(route: Route, viewModel?: BaseRoutableViewModel<any>) {
    viewModel = viewModel || this.currentViewModel();

    if (viewModel != null) {
      this.logger.debug(`Updating Routing State: ${ route.path }`);

      if (route.state != null) {
        this.logger.debug(JSON.stringify(route.state, null, 2));
      }

      // initialize the routing state to default as an empty object
      route.state = route.state || {};
      // assigning the route in the state (so the routed view model can access route properties)
      route.state.route = route;

      // start the routing state assignment
      viewModel.setRoutingState(route.state);
    }
  }

  private getActivator(route: Route) {
    // default by just fetching the mapped route directly
    let activator = this.routingMap[route.path];

    // if there is no directly mapped route, check for a parameterized route
    if (activator == null) {
      let result = Enumerable
        .fromArray(Object.keys(this.routingMap))
        .filter(x => x != null && x.length > 0 && x[0] === '^')
        .map(x => ({ key: x, regex: new RegExp(x, 'i') }))
        .map(x => ({ key: x.key, match: x.regex.exec(route.path) }))
        .filter(x => x.match != null)
        .map(x => ({ match: x.match, activator: this.routingMap[x.key] }))
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
}
