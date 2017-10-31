import { Observable, Subscription } from 'rxjs';
import 'ix';

import { ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel, isRoutableViewModel, RoutingBreadcrumb } from '../../React/BaseRoutableViewModel';
import { Route, RouteMapper, ComponentActivator, RoutedComponentActivator } from '../../../Routing';
import { routeManager } from '../../../Routing/RouteManager';
import { PubSub } from '../../../Utils';
import { RoutingStateChangedKey, RoutingStateChanged } from '../../../Events/RoutingStateChanged';

export const SplashKey = 'Splash';
export const DefaultKey = '*';

interface LoadComponentParams {
  prev: RoutedComponentActivator;
  next: RoutedComponentActivator;
}

interface ActivatedComponent {
  activator: RoutedComponentActivator;
  component: any;
}

export class RouteHandlerViewModel extends BaseViewModel {
  public static displayName = 'RouteHandlerViewModel';

  public currentRoute: ReadOnlyProperty<Route>;
  public routedComponent: ReadOnlyProperty<any>;
  public routingBreadcrumbs: ReadOnlyProperty<RoutingBreadcrumb[] | undefined>;
  public isLoading: ReadOnlyProperty<boolean>;

  private loadComponent: Command<any>;

  constructor(public routingMap: RouteMapper) {
    super();

    this.currentRoute = this
      .whenAny(routeManager.currentRoute, x => x)
      // a null route will never get processed so we can filter them out back here
      .filterNull()
      .toProperty();

    const loadComponentParams = this
      .whenAny(this.currentRoute, x => x)
      // we also need to filter out null routes here (this should only occur for the first event)
      .filterNull()
      .map(x => {
        // load the routed activator from our routing map
        return this.getActivator(x);
      })
      .catch(e => {
        this.alertForError(e, `Error Activating Route`);

        // we ran into a serious problem, don't propagate the event onward
        // this would happen if the routing map has bad RegExp data in it (perhaps?)
        return Observable.empty<RoutedComponentActivator>();
      })
      .flatMap(x => {
        // check if our activator is actually a redirect
        const result = this.handleRedirect(x);

        if (result == null) {
          // the activator was a redirect, so don't propagate the event onward
          return Observable.empty<RoutedComponentActivator>();
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
          return <LoadComponentParams>{
            prev: x.next || null,
            next: next || null,
          };
        },
        // this initializes the scan operator with an empty object (the first `x` value)
        <LoadComponentParams>{},
      )
      // publish is required here because we use this Observable in multiple streams
      // we use publish instead of share so we can kick this engine off at the end of stream composition
      .publish();

    const canLoadComponent = this
      .whenAny(loadComponentParams, x => x)
      .map(x => {
        // this condition should always be true, but we put it here just in case
        // we should never end up with loadComponentParams events with a null next activator
        return (
          x.next != null
        );
      })
      // we must share here because we use this Observable in multiple streams
      .share();

    this.loadComponent = this.command(canLoadComponent, (p: LoadComponentParams) => {
      return this.getObservableResultOrAlert(
        () => {
          // we need to construct an activated component structure so we can send routing state
          // into the viewModel (if it exists)
          return <ActivatedComponent>{
            activator: p.next,
            // NOTE: getComponent can return null
            component: this.getComponent(p.prev, p.next),
          };
        })
        .map(x => {
          // send the routing state to the view model (if it exists)
          // this function will return the view model so we can just return it directly
          return this.updateComponentRoutingState(x.activator, x.component);
        });
    });

    this.routedComponent = this.loadComponent.results
      .scan(
        (prev, curr) => {
          // try and dispose of our current routed component
          // providing it isn't the same component (which should never happen)
          if (prev !== curr) {
            Subscription.unsubscribe(prev);
          }

          return curr;
        },
        undefined,
      )
      .toProperty();

    this.routingBreadcrumbs = this
      .whenAny(this.routedComponent, x => x)
      .map(x => isRoutableViewModel(x) ? this.whenAny(x.breadcrumbs, y => y) : Observable.of(undefined))
      .switch()
      .toProperty();

    // when a route changes we enter loading mode and wait until the load finishes
    // at the very least, loadComponent should execute and result in a null view model
    // at which point we can exit loading mode
    this.isLoading = Observable
      .merge(
        this.currentRoute.changed.map(() => true),
        this.loadComponent.results.map(() => false),
      )
      // only show the loading screen if we are really taking a while to load
      // this will make the initial loading screen appear for at least 500ms as
      // well as prevent really short flashes of the loading screen
      .debounceTime(500)
      // initially begin in loading mode
      .toProperty(true);

    this.addSubscription(this
      // whenever there are new view model loading params and we can load our view model (which should be always)
      // we can project out just the loading params in preperation for the load command
      .whenAny(loadComponentParams, canLoadComponent, (params, canLoad) => ({ params, canLoad }))
      .filter(x => x.canLoad === true)
      .map(x => x.params)
      // debouce here to prevent loading param flux from hammering the load command
      // this may not be necessary for most components, but a small price to pay if a component
      // performs a lot of routing state changes in a short amount of time
      .debounceTime(100)
      .invokeCommand(this.loadComponent),
    );

    // if any component changes its routing state we'll pick it up here and ask the
    // currently routed component to generate a new routing state object, then
    // ask the routing manager to navigate to the current route with our updated state
    this.subscribeOrAlert(
      () => PubSub.observe<RoutingStateChanged>(RoutingStateChangedKey)
        .debounceTime(100),
      'Routing Handler State Changed Error',
      x => {
        if (this.currentRoute.value != null && this.routedComponent.value != null) {
          routeManager.navTo(this.currentRoute.value.path, this.routedComponent.value.getRoutingState(x), true);
        }
      },
    );

    // this handles document title changes for any routed component
    this.addSubscription(this
      // for every routed component
      .whenAny(this.routedComponent, x => x)
      // skip the initial null stream element
      .skip(1)
      // wait for routing to settle down
      .debounceTime(100)
      .subscribe(component => {
        if (isRoutableViewModel(component)) {
          // we have a routable component, so watch the documentTitle observable property
          this.addSubscription(this
            .whenAny(component.documentTitle, x => {
              if (String.isNullOrEmpty(x)) {
                // there isn't any title set (BAD) so warn and use a sane default
                this.logger.warn(`${ Object.getName(component) } does not provide a custom routed browser title`);

                return Object.getName(component);
              }

              return x;
            })
            // give rapid title changes a bit to settle down
            .debounceTime(100)
            .subscribe(x => {
              this.updateDocumentTitle(component, x);
            }),
          );
        }
        else {
          // we don't have a routable component
          // so try and generate a reasonable static title
          let title: string;

          if (component == null) {
            // this shouldn't happen in practice
            title = 'No Routed Component';
          }
          else if (String.isString(component)) {
            title = component;
          }
          else {
            title = Object.getName(component);
          }

          this.updateDocumentTitle(component, title);
        }
      }),
    );

    // connect the primary observable to allow the routing engine to start processing routes
    this.addSubscription(
      loadComponentParams
        .connect(),
    );
  }

  private updateDocumentTitle(component: any, title: string) {
    this.logger.debug(`Updating document title for component: ${ title }`, component);

    document.title = title;
  }

  private getActivator(route: Route) {
    let activator: ComponentActivator | undefined;

    // we shouldn't ever hit this function with a null route, but play safe anyways
    if (route != null) {
      this.logger.debug(`Loading View Model Activator for '${ route.path }'...`, route);

      // default by just fetching the mapped route directly
      activator = this.routingMap[route.path];

      // if there is no directly mapped route, check for a RegExp route
      if (activator == null) {
        const result = Object.keys(this.routingMap)
          .asIterable()
          .filter(x => x != null && x.length > 0 && x[0] === '^')
          .map(x => ({ key: x, match: new RegExp(x, 'i').exec(route.path) }))
          .filter(x => x.match != null)
          .map(x => ({ key: x.key, match: x.match!, activator: this.routingMap[x.key] }))
          .first();

        if (result != null) {
          // if we found a regex match route then set the match properties on the route
          route.match = result.match;

          const activatorPath = result.activator != null && result.activator.path != null ?
            ` ('${ result.activator.path }')` :
            '';

          this.logger.debug(`Matched RegExp Routing Path '${ route.path }' with '${ result.key }'${ activatorPath }`, route);

          activator = result.activator;
        }
      }

      // if we found no matching activator yet
      if (activator == null) {
        // warn about a missing route configuration
        this.logger.warn(`No activator for '${ route.path }', falling back to default route`, route);

        // fallback on to the default route (this could also be null)
        activator = Object.assign({ creator: () => undefined }, this.routingMap[DefaultKey]);
      }
    }

    // if our route was null (should never happen) always return a null value
    // otherwise merge the route with the activator to create the RoutedActivator
    // we default to the route path, but allow the activator to override that path
    return route == null ? undefined : Object.assign<RoutedComponentActivator>({ route, path: route.path }, activator);
  }

  private handleRedirect(activator: RoutedComponentActivator | undefined) {
    // a redirect is essentially a valid activator with only a path (and no creator)
    const isRedirect = (
      activator != null &&
      activator.route != null &&
      String.isNullOrEmpty(activator.path) === false &&
      activator.creator == null
    );

    if (isRedirect === true) {
      // this is a redirect route
      this.logger.debug(`Redirecting from '${ activator!.route.path }' to '${ activator!.path }'`, activator);

      // inform the routing manager of the redirection
      routeManager.navTo(activator!.path!, undefined, true);

      // return null to stop processing this route
      return null;
    }
    else {
      // not a redirect so just return the activator unchanged
      return activator;
    }
  }

  private getComponent(prev: RoutedComponentActivator, next: RoutedComponentActivator): any {
    if (next == null || next.route == null || next.creator == null) {
      // invalid activator, return null (this shouldn't happen)
      return null;
    }
    // routing activator paths are unique, so we can compare them for best results
    else if (prev != null && prev.path === next.path) {
      this.logger.debug(`Using same view model for route change (${ prev.route.path } -> ${ next.route.path })`, next);

      // our old activator matches our new activator, so return the current view model
      // we perform a null check on our observable property just in case, it should never be null
      return this.routedComponent == null ? null : this.routedComponent.value;
    }
    else {
      this.logger.debug(`Loading view model for route '${ next.route.path }'`, next);

      // create a new component for the route using the activator function
      return next.creator(next.route);
    }
  }

  private updateComponentRoutingState(activator: RoutedComponentActivator, component: any) {
    // our activator should never be null at this point, but our component certainly could be
    if (activator != null && isRoutableViewModel(component)) {
      this.logger.debug(`Updating routing state for '${ activator.route.path }'`, activator, component);

      // initialize the routing state to default as an empty object
      activator.route.state = activator.route.state || {};
      // assigning the route in the state (so the routed view model can access route properties)
      activator.route.state.route = activator.route;

      // start the routing state assignment
      component.setRoutingState(activator.route.state);
    }

    return component;
  }
}
