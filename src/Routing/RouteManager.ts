'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import HashCodec from './HashCodec';
import { default as PubSub, ISubscriptionHandle } from '../Utils/PubSub';
import { RouteChangedKey, IRouteChanged } from '../Events/RouteChanged';

export interface IRoute {
  path: string;
  params: string;
  state: Object;
}

export class RouteManager implements Rx.IDisposable {
  public static displayName = 'RouteManager';
  public static EnableRouteDebugging = false;

  constructor(hashChanged: Rx.Observable<string>, public hashCodec = new HashCodec()) {
    this.currentRoute = hashChanged
      .debounce(100)
      .select(x => {
        let route = hashCodec.Decode(x, (path, params, state) => <IRoute>{path, params, state});

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

    this.routeChangedHandle = PubSub.subscribe<IRouteChanged>(RouteChangedKey, x => this.navTo(x.path, x.state, x.uriEncode));
  }

  private routeChangedHandle: ISubscriptionHandle;
  public currentRoute: wx.IObservableProperty<IRoute>;

  public navTo(path: string, state?: Object, uriEncode = false) {
    if (String.isNullOrEmpty(path) == false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      let hash = this.hashCodec.Encode(path, state, uriEncode);

      if (RouteManager.EnableRouteDebugging) {
        console.log(String.format('[Route    ] Routing to Hash: {0}', hash));

        if (state != null) {
          console.log(JSON.stringify(state, null, 2));
        }
      }

      window.location.hash = hash;
    }
  }

  public dispose() {
    this.routeChangedHandle = PubSub.unsubscribe(this.routeChangedHandle);
  }
}

export default RouteManager;
