'use strict';

// this is a bit of a hack to *ensure* that Rx is imported (as it is required by wx)
import * as Rx from 'rx';
import * as wx from 'webrx';
export { Rx, wx };

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './Extensions/Object';
import './Extensions/String';

import logManager from './Components/Common/App/Logging';
import RouteManager from './Routing/RouteManager';
import AppView from './Components/Common/App/AppView';
import { AppViewModel, IAppConfig } from './Components/Common/App/AppViewModel';
import RoutingMap from './Components/Common/App/RoutingMap';
import ViewMap from './Components/Common/App/ViewMap';

let logger = logManager.getLogger('index');

let container = document.getElementById('app');

if (container) {
  let hashChanged = Rx.Observable
    .fromEvent<HashChangeEvent>(window, 'hashchange')
    .select(x => window.location.hash)
    .startWith(window.location.hash);

  let config: IAppConfig = {
    routingMap: RoutingMap
  };

  let routeManager = new RouteManager(hashChanged);
  let viewModel = new AppViewModel(routeManager, config);

  ReactDOM.render(<AppView viewModel={viewModel} viewMap={ViewMap} />, document.getElementById('app'));
}
