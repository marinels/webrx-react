import { Route } from './RouteManager';

export interface ComponentActivator {
  path?: string;
  creator?: (route: Route) => any;
}

export interface RoutedComponentActivator extends ComponentActivator {
  route: Route;
}

export interface RouteMapper {
  [ path: string ]: ComponentActivator;
}

export const RouteMap = <RouteMapper>{
};
