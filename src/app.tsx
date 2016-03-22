'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import framework API surface
import * as wxr from './web.rx.react';
// import routing map
import { RoutingMap as routingMap } from './Components/Common/App/RoutingMap';

let container = document.getElementById('app');

if (container) {
  let { AppView, AppViewModel } = wxr.Components;

  ReactDOM.render(
    <AppView viewModel={new AppViewModel(new wxr.Routing.RouteManager(), { routingMap })} />,
    container
  );
}
