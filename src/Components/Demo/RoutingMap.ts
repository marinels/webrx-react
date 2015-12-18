'use strict';

import BaseViewModel from '../React/BaseViewModel';
import { IMenuItem } from '../Common/PageHeader/Actions';

// import DataGridViewModel from '../Common/DataGrid/DataGridViewModel';

export interface IViewModelActivator {
  (state: any): BaseViewModel;
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

  public addRoute(path: string, name: string, activator: IViewModelActivator, iconName?: string) {
    this.map[path] = activator;
    this.menuItems.push({ id: path, header: name, uri: this.getUri(path), iconName: iconName || this.defaultIconName });
  }

  public getUri(path: string) {
    return String.format('{0}/{1}', this.baseUri, path);
  }

  public getRoutablePaths() {
    return Object.getOwnPropertyNames(this.map);
  }
}

let routingMap = new RoutingMap();

// routingMap.addRoute('DataGrid', 'Data Grid', (state: any) => new DataGridViewModel(
//   undefined,
//   undefined,
//   false,
//   { id: 1, value: 'a' },
//   { id: 2, value: 'b' },
//   { id: 3, value: 'c' }
// ));

export default routingMap;
