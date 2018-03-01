import { ReadOnlyProperty } from '../WebRx';
import { Logging } from '../Utils';
import { HashCodec } from './HashCodec';
import { Route, HashManager } from './Interfaces';
import { historyStateHashManager, windowLocationHashManager } from './HashManager';
import { getPath, normalizePath } from './Helpers';

export class RouteManager {
  public static displayName = 'RouteManager';

  private readonly logger = Logging.getLogger(RouteManager.displayName);
  private readonly hashManager: HashManager;
  public readonly currentRoute: ReadOnlyProperty<Route>;

  constructor(hashManager?: HashManager, public readonly hashCodec = HashCodec.Default) {
    if (hashManager == null) {
      hashManager = historyStateHashManager;
    }

    this.hashManager = hashManager;

    this.currentRoute = this.hashManager.hashChanged
      .startWith(window.location.hash)
      .distinctUntilChanged()
      .map(x => {
        const route = hashCodec.decode(x, (path, params, state) => <Route>{ path, params, state });

        // reconstruct the route hash
        let hash = '#' + route.path;
        if (route.params && route.params.length > 0) {
          hash += route.params;
        }

        // if the reconstructed route hash differs from the current hash
        // re-route to the constructed hash so that we have a consistent route
        // NOTE: this can happen if the passed in route is not sanitized, as the
        //       decode function will sanitize input
        // i.e., if no route is supplied (no hash) then a default route of #/ is
        //       coerced from the decode function.
        if (hash !== x) {
          this.navTo(route.path, route.state, true);
          // set the current route to null to ignore further processing
          return undefined;
        }

        return route;
      })
      .filterNull()
      .toProperty();
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
