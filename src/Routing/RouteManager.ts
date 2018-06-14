import { Scheduler, Subscription } from 'rxjs';

import { Logging } from '../Utils';
import { ReadOnlyProperty } from '../WebRx';
import { HashCodec } from './HashCodec';
import { historyStateHashManager } from './HashManager';
import { getPath, normalizePath } from './Helpers';
import { HashManager, Route } from './Interfaces';

export class RouteManager extends Subscription {
  public static displayName = 'RouteManager';

  private readonly logger = Logging.getLogger(RouteManager.displayName);
  private readonly redirectSubscription: Subscription;
  private readonly hashManager: HashManager;
  public readonly currentRoute: ReadOnlyProperty<Route>;

  constructor(hashManager?: HashManager, public readonly hashCodec = HashCodec.Default) {
    super();

    if (hashManager == null) {
      hashManager = historyStateHashManager;
    }

    this.hashManager = hashManager;

    const routingEvents = this.hashManager.hashChanged
      .startWith(window.location.hash)
      .distinctUntilChanged()
      .map(x => {
        const change = {
          route: hashCodec.decode(x, (path, params, state) => ({ path, params, state } as Route)),
          redirect: false,
        };

        // reconstruct the route hash
        let hash = '#' + change.route.path;
        if (change.route.params && change.route.params.length > 0) {
          hash += change.route.params;
        }

        // if the reconstructed route hash differs from the current hash
        // re-route to the constructed hash so that we have a consistent route
        // NOTE: this can happen if the passed in route is not sanitized, as the
        //       decode function will sanitize input
        // i.e., if no route is supplied (no hash) then a default route of #/ is
        //       coerced from the decode function.
        if (hash !== x) {
          change.redirect = true;
        }

        return change;
      })
      // we must use the async scheduler to prevent recursive re-entrancy calls
      // re-entrancy can occur on redirects, we want each new route to be handled
      // as its own routing state change in sequence, which the async scheduler permits.
      .observeOn(Scheduler.async)
      .share();

    this.currentRoute = routingEvents
      .filter(x => x.redirect === false)
      .map(x => x.route)
      .toProperty();

    this.addSubscription(
      this.redirectSubscription = routingEvents
        .filter(x => x.redirect)
        .subscribe(x => {
          this.navTo(x.route.path, x.route.state, true);
        }),
      );
  }

  public navTo(path: string, state?: any, replace = false, uriEncode = false) {
    path = getPath(state) || path;

    if (String.isNullOrEmpty(path) === false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      path = normalizePath(path, undefined, this.hashCodec);

      const hash = this.hashCodec.encode(path, state, uriEncode);

      this.logger.debug(`Routing to Hash: ${ hash }`, state);

      if (state != null) {
        this.logger.debug(JSON.stringify(state, null, 2));
      }

      this.hashManager.updateHash(hash, state, '', replace);
    }
  }
}

export const routeManager = new RouteManager();
