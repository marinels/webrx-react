import { Observable } from 'rx';
import 'ix';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { Manager, Route } from '../../../Routing/RouteManager';
import { RouteMapper, ViewModelActivator } from '../../../Routing/RoutingMap';
import { PubSub } from '../../../Utils';
import { RoutingStateChangedKey, RoutingStateChanged } from '../../../Events/RoutingStateChanged';

export const SplashKey = 'Splash';

// this is a special (internal) activator that additionally includes the route that created it
interface RoutedActivator extends ViewModelActivator {
  route: Route;
}

interface LoadViewModelParams {
  prev: RoutedActivator;
  next: RoutedActivator;
}

export class RouteHandlerViewModel extends BaseViewModel {
  public static displayName = 'RouteHandlerViewModel';

  public currentRoute: wx.IObservableReadOnlyProperty<Route>;
  public currentViewModel: wx.IObservableReadOnlyProperty<any>;
  public isLoading: wx.IObservableReadOnlyProperty<boolean>;

  private loadViewModel: wx.ICommand<BaseRoutableViewModel<any>>;

  constructor(public routingMap: RouteMapper) {
    super();

    this.currentRoute = wx
      .whenAny(Manager.currentRoute, x => x)
      // a null route will never get processed so we can filter them out back here
      .filter(x => x != null)
      .toProperty();

    const loadViewModelParams = wx
      .whenAny(this.currentRoute, x => x)
      // we also need to filter out null routes here (this should only occur for the first event)
      .filter(x => x != null)
      .map(x => {
        // load the routed activator from our routing map
        return this.getActivator(x);
      })
      .catch(e => {
        this.alertForError(e, `Error Activating Route`);

        // we ran into a serious problem, don't propagate the event onward
        // this would happen if the routing map has bad RegExp data in it (perhaps?)
        return Observable.empty<RoutedActivator>();
      })
      .flatMap(x => {
        // check if our activator is actually a redirect
        const result = this.handleRedirect(x);

        if (result == null) {
          // the activator was a redirect, so don't propagate the event onward
          return Observable.empty<RoutedActivator>();
        }
        else {
          // this is a normal activator so just push this event onward
          return Observable.of(result);
        }
      })
      .scan(
        (x, next) => {
          // build a prev/next pair of activator results
          // we will use the previous activator to confirm if we create a new view model or not
          // we use || null here to ensure our undefined values are always null (consistency)
          return <LoadViewModelParams>{
            prev: x.next || null,
            next: next || null,
          };
        },
        // this initializes the scan operator with an empty object (the first `x` value)
        <LoadViewModelParams>{}
      )
      // publish is required here because we use this Observable in multiple streams
      // we use publish instead of share so we can kick this engine off at the end of stream composition
      .publish();

    const canLoadViewModel = wx
      .whenAny(loadViewModelParams, x => x)
      .map(x => {
        // this condition should always be true, but we put it here just in case
        // we should never end up with loadViewModelParams events with a null next activator
        return (
          x.next != null
        );
      })
      // we must share here because we use this Observable in multiple streams
      .share();

    this.loadViewModel = wx.asyncCommand(canLoadViewModel, (p: LoadViewModelParams) => {
      return this.getObservableResultOrAlert(
        () => {
          // we need to construct an anonymous structure with the activator so we can send routing state
          // into the viewModel (if it exists)
          return {
            activator: p.next,
            // NOTE: getViewModel can return null
            viewModel: this.getViewModel(p.prev, p.next),
          };
        })
        .map(x => {
          // send the routing state to the view model (if it exists)
          // this function will return the view model so we can just return it directly
          return this.updateViewModelRoutingState(x.activator, x.viewModel);
        });
    });

    this.currentViewModel = this.loadViewModel.results
      .toProperty();

    // when a route changes we enter loading mode and wait until the load finishes
    // at the very least, loadViewModel should execute and result in a null view model
    // at which point we can exit loading mode
    this.isLoading = Observable
      .merge(
        this.currentRoute.changed.map(x => true),
        this.loadViewModel.results.map(x => false),
      )
      // only show the loading screen if we are really taking a while to load
      // this will make the initial loading screen appear for at least 500ms as
      // well as prevent really short flashes of the loading screen
      .debounce(500)
      // initially begin in loading mode
      .toProperty(true);

    this.subscribe(wx
      // whenever there are new view model loading params and we can load our view model (which should be always)
      // we can project out just the loading params in preperation for the load command
      .whenAny(loadViewModelParams, canLoadViewModel, (params, canLoad) => ({ params, canLoad }))
      .filter(x => x.canLoad === true)
      .map(x => x.params)
      // debouce here to prevent loading param flux from hammering the load command
      // this may not be necessary for most components, but a small price to pay if a component
      // performs a lot of routing state changes in a short amount of time
      .debounce(100)
      .invokeCommand(this.loadViewModel)
    );

    this.subscribe(
      // if any component changes its routing state we'll pick it up here and ask the
      // currently routed component to generate a new routing state object, then
      // ask the routing manager to navigate to the current route with our updated state
      PubSub.subscribe<RoutingStateChanged>(RoutingStateChangedKey, x => {
        if (this.currentRoute() != null && this.currentViewModel() != null) {
          Manager.navTo(this.currentRoute().path, this.currentViewModel().getRoutingState(x));
        }
      })
    );

    // connect the primary observable to allow the routing engine to start processing routes
    this.subscribe(
      loadViewModelParams
        .connect()
    );
  }

  private getActivator(route: Route) {
    let activator: ViewModelActivator;

    // we shouldn't ever hit this function with a null route, but play safe anyways
    if (route != null) {
      this.logger.debug(`Loading View Model Activator for '${ route.path }'...`, route);

      // default by just fetching the mapped route directly
      activator = this.routingMap[route.path];

      // if there is no directly mapped route, check for a RegExp route
      if (activator == null) {
        const result = Object
          .keys(this.routingMap)
          .filter(x => x != null && x.length > 0 && x[0] === '^')
          .map(x => ({ key: x, match: new RegExp(x, 'i').exec(route.path) }))
          .filter(x => x.match != null)
          .map(x => ({ key: x.key, match: x.match, activator: this.routingMap[x.key] }))
          .asEnumerable()
          .firstOrDefault();

        if (result != null) {
          // if we found a regex match route then set the match properties on the route
          route.match = result.match;

          this.logger.debug(`Matched RegExp Routing Path '${ route.path }' with '${ result.key }' ('${ result.activator.path }')`, route);

          activator = result.activator;
        }
      }

      // if we found no matching activator yet
      if (activator == null) {
        // warn about a missing route configuration
        this.logger.warn(`No activator for '${ route.path }', falling back to default route`, route);

        // fallback on to the default route (this could also be null)
        activator = this.routingMap['*'];
      }
    }

    // if our route was null (should never happen) always return a null value
    // otherwise merge the route with the activator to create the RoutedActivator
    return route == null ? null : Object.assign<RoutedActivator>({ route }, activator);
  }

  private handleRedirect(activator: RoutedActivator) {
    // a redirect is essentially a valid activator with only a path (and no creator)
    const isRedirect = (
      activator != null &&
      activator.route != null &&
      String.isNullOrEmpty(activator.path) === false &&
      activator.creator == null
    );

    if (isRedirect === true) {
      // this is a redirect route
      this.logger.debug(`Redirecting from '${ activator.route.path }' to '${ activator.path }'`, activator);

      // inform the routing manager of the redirection
      Manager.navTo(activator.path);

      // return null to stop processing this route
      return null;
    }
    else {
      // not a redirect so just return the activator unchanged
      return activator;
    }
  }

  private getViewModel(prev: RoutedActivator, next: RoutedActivator): BaseRoutableViewModel<any> {
    if (next == null || next.route == null || next.creator == null) {
      // invalid activator, return null (this shouldn't happen)
      return null;
    }
    // routing activator paths are unique, so we can compare them for best results
    else if (prev != null && prev.path === next.path) {
      this.logger.debug(`Using same view model for route change (${ prev.route.path } -> ${ next.route.path })`, next);

      // our old activator matches our new activator, so return the current view model
      // we perform a null check on our observable property just in case, it should never be null
      return this.currentViewModel == null ? null : this.currentViewModel();
    }
    else {
      this.logger.debug(`Loading view model for route '${ next.route.path }'`, next);

      // create a new view model for the route using the activator function
      return next.creator<BaseRoutableViewModel<any>>(next.route);
    }
  }

  private updateViewModelRoutingState(activator: RoutedActivator, viewModel: BaseRoutableViewModel<any>) {
    // our activator should never be null at this point, but our view model certainly could be
    if (activator != null && viewModel != null) {
      this.logger.debug(`Updating routing state for '${ activator.route.path }'`, activator, viewModel);

      // initialize the routing state to default as an empty object
      activator.route.state = activator.route.state || {};
      // assigning the route in the state (so the routed view model can access route properties)
      activator.route.state.route = activator.route;

      // start the routing state assignment
      viewModel.setRoutingState(activator.route.state);
    }

    return viewModel;
  }
}
