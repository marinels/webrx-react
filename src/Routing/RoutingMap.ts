import { Route } from './Interfaces';

export interface ComponentActivator {
  path?: string;
  creator?: (route: Route) => any;
}

export interface RoutedComponentActivator extends ComponentActivator {
  path: string;
  route: Route;
}

export interface RouteMapper extends StringMap<ComponentActivator> {}

export const RouteMap: RouteMapper = {};
