'use strict';

import { IMenuItem } from '../Common/PageHeader/Actions';

import SplashViewModel from '../Common/Splash/SplashViewModel';

export interface IViewModelActivator {
  (state: any): any;
}

export interface IViewModelMap {
  [key: string]: IViewModelActivator;
}

class RoutingMap {
  public static displayName = 'RoutingMap';

  constructor(private baseUri = '#/demo', private defaultIconName = 'fa-flask') {
  }

  public map: IViewModelMap = {};
  public menuItems: IMenuItem[] = [];

  public addRoute(path: string, name: string, activator: IViewModelActivator, uri?: string, iconName?: string) {
    this.map[path] = activator;
    this.menuItems.push(<IMenuItem>{ id: path, header: name, uri: this.getUri(path, uri), iconName: iconName || this.defaultIconName, order: this.menuItems.length });
  }

  public getUri(path: string, uri: string) {
    return String.format('{0}/{1}', this.baseUri, uri || path);
  }
}

let routingMap = new RoutingMap();

routingMap.addRoute('Splash', 'Splash', (state: any) => new SplashViewModel('Demo Splash Screen'));

export default routingMap;
