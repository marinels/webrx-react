'use strict';

import { IRoutingMap } from '../Common/RouteHandler/RouteHandlerViewModel';
import { IRoute } from '../../Routing/RouteManager';

import DashboardViewModel from '../Dashboard/DashboardViewModel';
// import ComponentDemoViewModel from '../Demo/ComponentDemoViewModel';

export let RoutingMap: IRoutingMap = {
  '/': { path: '/dashboard' },
  // The dashboard routing regex contains a group to allow extracting path elements when routed to
  // we also override the serialized routing path (to remove the additional path elements)
  // this ensures that a Dashboard route always uses the same serialized routing path
  '^/dashboard(/(.*))?': { path: '/dashboard', creator: (route: IRoute) => new DashboardViewModel(true) },
  // '^/demo(/(.*))?': { path: '/demo', creator: (route: IRoute) => new ComponentDemoViewModel() }
};

export default RoutingMap;
