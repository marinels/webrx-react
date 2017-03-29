import { Observable, Subject, Scheduler } from  'rx';

import { wx } from '../WebRx';
import { Logging } from '../Utils';
import { HashCodec } from './HashCodec';

export interface Route {
  path: string;
  params: string;
  state: any;
  match: RegExpMatchArray;
}

export interface HashManager {
  readonly hashChanged: Observable<string>;
  // hash will contain the # prefix
  updateHash: (hash: string, state: any, title: string, replace: boolean) => void;
}

// this is a very basic hash manager, it does not support history replacement
export const windowLocationHashManager = <HashManager>{
  hashChanged: Observable
    .fromEvent<HashChangeEvent>(window, 'hashchange')
    .map(x => window.location.hash),
  updateHash: (hash) => {
    window.location.hash = hash;
  },
};

// this is a more comprehensive hash manager that does support history replacement
// however, this hash manager requires at least IE11
// if support is not detected, then the window location hash manager is used instead
class HistoryStateHashManager implements HashManager {
  private changeHash: wx.ICommand<string>;

  constructor() {
    this.changeHash = wx.asyncCommand((hash: string) => {
      return Observable.of(hash);
    });
  }

  updateHash(hash: string, state: any, title: string, replace: boolean) {
    if (history != null && history.replaceState instanceof Function && history.pushState instanceof Function) {
      if (replace === true) {
        history.replaceState(state, title, hash);
      }
      else {
        history.pushState(state, title, hash);
      }

      this.changeHash.execute(hash);
    }
    else {
      // history API not supported, fallback onto window location hash manager
      windowLocationHashManager.updateHash(hash, state, title, replace);
    }
  }

  public get hashChanged() {
    return Observable
      // we need to merge both hash change requests (from updateHash)
      // as well as manual URI hash changes from the window location hash manager
      .merge(
        this.changeHash.results,
        windowLocationHashManager.hashChanged,
      )
      // we must use the async scheduler to prevent recursive re-entrancy calls
      // re-entrancy can occur on redirects, we want each new route to be handled
      // as its own routing state change in sequence, which the async scheduler permits.
      .observeOn(Scheduler.async);
  }
}

export const historyStateHashManager = new HistoryStateHashManager();

export class RouteManager {
  public static displayName = 'RouteManager';

  private logger = Logging.getLogger(RouteManager.displayName);
  private hashManager: HashManager;
  public currentRoute: wx.IObservableReadOnlyProperty<Route>;

  constructor(hashManager?: HashManager, public hashCodec = new HashCodec()) {
    if (hashManager == null) {
      hashManager = historyStateHashManager;
    }

    this.hashManager = hashManager;

    this.currentRoute = this.hashManager.hashChanged
      .startWith(window.location.hash)
      .debounce(100)
      .distinctUntilChanged()
      .map(x => {
        let route = hashCodec.decode(x, (path, params, state) => <Route>{path, params, state});

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
      .filter(x => x != null)
      .map(x => x!)
      .toProperty();
  }

  private getPath(state: {route: Route}) {
    let path: string | undefined;

    if (state != null && state.route != null && String.isNullOrEmpty(state.route.path) === false) {
      path = state.route.path;

      delete state.route;
    }

    return path;
  }

  public normalizePath(path: string, currentPath?: string) {
    if (String.isNullOrEmpty(path) === false) {
      if (path[0] !== '/') {
        if (String.isNullOrEmpty(currentPath)) {
          currentPath = this.hashCodec.decode(window.location.hash, x => x);
        }

        // relative path
        path = `${ currentPath!.split('/').slice(0, -1).join('/') }/${ path }`;
      }

      // manage relative path elements (..)
      let pathElems = path.split('/');
      for (let i = 0; i < pathElems.length; ++i) {
        if (pathElems[i] === '..') {
          if (i === 0) {
            pathElems.shift();
            --i;
          }
          else {
            pathElems.splice(i - 1, 2);
            i -= 2;
          }
        }
        else if (pathElems[i] === '.') {
          pathElems.splice(i--, 1);
        }
        else if (pathElems[i] === '') {
          // trim out empty path elements (except for the beginning and end)
          if (i > 0 && i < pathElems.length - 1) {
            pathElems.splice(i--, 1);
          }
        }
      }

      path = pathElems.join('/');
    }

    return path;
  }

  public navTo(path: string, state?: any, replace = false, uriEncode = false) {
    path = this.getPath(state) || path;

    if (String.isNullOrEmpty(path) === false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      path = this.normalizePath(path);

      let hash = this.hashCodec.encode(path, state, uriEncode);

      this.logger.debug(`Routing to Hash: ${ hash }`, state);

      if (state != null) {
        this.logger.debug(JSON.stringify(state, null, 2));
      }

      this.hashManager.updateHash(hash, state, '', replace);
    }
  }
}

export const Manager = new RouteManager();
