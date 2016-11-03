export const NavigationKey = 'Navigation';

export interface Navigation {
  path: string;
  state?: any;
  uriEncode?: boolean;
}
