'use strict';

import { IRoutingMap } from '../Common/RouteHandler/RouteHandlerViewModel';
import { IRoute } from '../../Routing/RouteManager';

import DashboardViewModel from '../Dashboard/DashboardViewModel';

export let RoutingMap: IRoutingMap = {
  '/': { path: '/dashboard' },
  '^/dashboard(/(.*))?': { path: '/dashboard', creator: (route: IRoute) => new DashboardViewModel(true) }
};

export default RoutingMap;
