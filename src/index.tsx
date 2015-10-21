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
import AppViewModel from './Components/App/AppViewModel';

let container = document.getElementById('app');

if (container) {
  let hashChanged = Rx.Observable
    .fromEvent<HashChangeEvent>(window, 'hashChange')
    .select(x => window.location.hash)
    .startWith(window.location.hash);

  let routeManager = new RouteManager(hashChanged)
  let viewModel = new AppViewModel(routeManager);

  // config the App
  viewModel.config.EnableViewRenderDebugging = true;

  ReactDOM.render(<AppView viewModel={viewModel}/>, document.getElementById('app'));
}
