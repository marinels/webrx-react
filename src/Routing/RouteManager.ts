import * as Rx from 'rx';
import * as wx from 'webrx';

import { getLogger } from '../Utils/Logging/LogManager';
import { HashCodec } from './HashCodec';
import { Default as pubSub, ISubscriptionHandle } from '../Utils/PubSub';

export interface IRoute {
  path: string;
  params: string;
  state: any;
  match: RegExpMatchArray;
}

export class RouteManager implements Rx.IDisposable {
  public static displayName = 'RouteManager';

  private routeChangedHandle: ISubscriptionHandle;
  private logger = getLogger(RouteManager.displayName);
  public currentRoute: wx.IObservableProperty<IRoute>;

  constructor(hashChanged?: Rx.Observable<string>, public hashCodec = new HashCodec()) {
    if (hashChanged == null) {
      hashChanged = Rx.Observable
        .fromEvent<HashChangeEvent>(window, 'hashchange')
        .select(x => window.location.hash)
        .startWith(window.location.hash);
    }

    this.currentRoute = hashChanged
      .debounce(100)
      .select(x => {
        let route = hashCodec.decode(x, (path, params, state) => <IRoute>{path, params, state});

        let hash = '#' + route.path;
        if (route.params && route.params.length > 0) {
          hash += route.params;
        }

        if (hash !== x) {
          this.navTo(route.path, route.state);
          route = null;
        }

        return route;
      })
      .where(x => x != null)
      .toProperty();
  }

  private getPath(state: {route: IRoute}) {
    let path: string = null;

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
        path = `${currentPath.split('/').slice(0, -1).join('/')}/${path}`;
      }

      // manage relative path elements (..)
      let pathElems = path.split('/');
      for (let i = 0; i < pathElems.length; ++i) {
        if (pathElems[i] === '..') {
          if (i === 0) {
            pathElems.shift();
            --i;
          } else {
            pathElems.splice(i - 1, 2);
            i -= 2;
          }
        } else if (pathElems[i] === '.') {
          pathElems.splice(i--, 1);
        } else if (pathElems[i] === '') {
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

  public navTo(path: string, state?: any, uriEncode = false) {
    path = this.getPath(state) || path;

    if (String.isNullOrEmpty(path) === false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      path = this.normalizePath(path);

      let hash = this.hashCodec.encode(path, state, uriEncode);

      this.logger.debug(`Routing to Hash: ${hash}`);

      if (state != null) {
        this.logger.debug(JSON.stringify(state, null, 2));
      }

      window.location.hash = hash;
    }
  }

  public dispose() {
    this.routeChangedHandle = pubSub.unsubscribe(this.routeChangedHandle);
  }
}

export const Default = new RouteManager();
