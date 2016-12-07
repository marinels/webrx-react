import { Route } from './RouteManager';

export interface ViewModelActivator {
  path?: string;
  creator?: <T>(route: Route) => T;
}

export interface RouteMapper {
  [ path: string ]: ViewModelActivator;
}

export const RouteMap = <RouteMapper>{
};
