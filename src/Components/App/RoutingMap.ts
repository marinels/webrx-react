'use strict';

import { IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import { IRoute } from '../../Routing/RouteManager';

import DashboardViewModel from '../Dashboard/DashboardViewModel';

export let RoutingMap: IRoutingMap = {
  '/': '/dashboard',
  '/dashboard': (route: IRoute) => new DashboardViewModel(true)
};

export default RoutingMap;
