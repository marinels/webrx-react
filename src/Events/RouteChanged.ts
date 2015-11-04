export const RouteChangedKey = 'RouteChanged';

export interface IRouteChanged {
  path: string;
  state: Object;
  uriEncode: boolean;
}

export default RouteChangedKey;
