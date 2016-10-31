import { RoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import { Route } from '../../../Routing/RouteManager';
import { ComponentDemoViewModel } from '../../Demo/ComponentDemoViewModel';

export const AppRoutingMap = <RoutingMap>{
  '/': { path: '/demo' },
  // The Demo routing regex contains a group to allow extracting path elements when routed to
  // we also override the serialized routing path (to remove the additional path elements)
  // this ensures that a Demo route always uses the same serialized routing path
  '^/demo(/(.*))?': { path: '/demo', creator: (route: Route) => new ComponentDemoViewModel() },
};
