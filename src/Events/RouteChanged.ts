export const RouteChangedKey = 'RouteChanged';

export interface IRouteChanged {
  path: string;
  state: any;
  uriEncode: boolean;
}

export default RouteChangedKey;
