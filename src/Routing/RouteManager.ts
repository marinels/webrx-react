'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import HashCodec from './HashCodec';

export interface IRoute {
  path: string;
  params: string;
  state: Object;
}

export class RouteManager implements Rx.IDisposable {
  public static EnableRouteDebugging = false;

  constructor(hashChanged: Rx.Observable<string>, public hashCodec = new HashCodec()) {
    this.hashChangedSubscription = hashChanged
      .debounce(100)
      .select(x => {
        let route = hashCodec.Decode(x, (path, params, state) => <IRoute>{path, params, state});

        let hash = '#' + route.path;
        if (route.params && route.params.length > 0) {
          hash += route.params;
        }

        if (hash !== x) {
          this.NavTo(route.path, route.state);
          route = null;
        }

        return route;
      })
      .where(x => x != null)
      .invokeCommand(this.routeChanged);
  }

  private hashChangedSubscription: Rx.IDisposable;
  public routeChanged = wx.asyncCommand<IRoute>((x: IRoute) => Rx.Observable.return(x));

  public NavTo(path: string, state?: Object, uriEncode = false) {
    if (String.isNullOrEmpty(path) == false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      let hash = this.hashCodec.Encode(path, state, uriEncode);

      if (RouteManager.EnableRouteDebugging) {
        console.log(String.format('Routing to Hash: {0}', hash));

        if (state != null) {
          console.log(JSON.stringify(state, null, 2));
        }
      }

      window.location.hash = hash;
    }
  }

  public dispose() {
    this.hashChangedSubscription = Object.dispose(this.hashChangedSubscription);
  }
}

export default RouteManager;
