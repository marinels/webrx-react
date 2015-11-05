'use strict';

// this is a bit of a hack to *ensure* that Rx is imported (as it is required by wx)
import * as Rx from 'rx';
export { Rx };

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './Extensions/Object';
import './Extensions/String';
import './Extensions/Rx';

import RouteManager from './Routing/RouteManager';
import AppView from './Components/App/AppView';
import { AppViewModel, IAppConfig } from './Components/App/AppViewModel';
import RoutingMap from './Components/App/RoutingMap';

let container = document.getElementById('app');

if (container) {
  let hashChanged = Rx.Observable
    .fromEvent<HashChangeEvent>(window, 'hashchange')
    .select(x => window.location.hash)
    .startWith(window.location.hash);

  let config: IAppConfig = {
    EnableViewModelDebugging: DEBUG,
    EnableViewDebugging: DEBUG,
    EnableRouteDebugging: DEBUG,
    EnableStoreDebugging: DEBUG,

    routingMap: RoutingMap
  };
  
  let routeManager = new RouteManager(hashChanged)
  let viewModel = new AppViewModel(routeManager, config);

  ReactDOM.render(<AppView viewModel={viewModel}/>, document.getElementById('app'));
}
