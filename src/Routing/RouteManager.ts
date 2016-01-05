'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import logManager from '../Components/App/Logging';
import HashCodec from './HashCodec';
import { default as PubSub, ISubscriptionHandle } from '../Utils/PubSub';
import { RouteChangedKey, IRouteChanged } from '../Events/RouteChanged';

export interface IRoute {
  path: string;
  params: string;
  state: any;
  match: RegExpMatchArray;
}

export class RouteManager implements Rx.IDisposable {
  public static displayName = 'RouteManager';

  protected logger = logManager.getLogger(Object.getName(this));

  constructor(hashChanged: Rx.Observable<string>, public hashCodec = new HashCodec()) {
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

    this.routeChangedHandle = PubSub.subscribe<IRouteChanged>(RouteChangedKey, x => this.navTo(x.path, x.state, x.uriEncode));
  }

  private routeChangedHandle: ISubscriptionHandle;
  public currentRoute: wx.IObservableProperty<IRoute>;

  public navTo(path: string, state?: Object, uriEncode = false) {
    if (String.isNullOrEmpty(path) == false) {
      if (path[0] === '#') {
        path = path.substring(1);
      }

      let hash = this.hashCodec.encode(path, state, uriEncode);

      this.logger.debug('Routing to Hash: {0}', hash);

      if (state != null) {
        this.logger.debug(JSON.stringify(state, null, 2));
      }

      window.location.hash = hash;
    }
  }

  public dispose() {
    this.routeChangedHandle = PubSub.unsubscribe(this.routeChangedHandle);
  }
}

export default RouteManager;
