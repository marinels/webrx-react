'use strict';

import { IMenuItem } from '../Common/PageHeader/Actions';

import SplashViewModel from '../Common/Splash/SplashViewModel';
import ListViewModel from '../Common/List/ListViewModel';
import DataGridViewModel from '../Common/DataGrid/DataGridViewModel';

export interface IViewModelActivator {
  (state: any): any;
}

export interface IViewModelMap {
  [key: string]: IViewModelActivator;
}

class RoutingMap {
  public static displayName = 'RoutingMap';

  constructor(private baseUri = '#/demo', private defaultIconName = 'flask') {
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
routingMap.addRoute('TimeSpanInput', 'Time Span Input', (state: any) => 'TimeSpanInput');
routingMap.addRoute('ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
routingMap.addRoute('List', 'List', (state: any) => new ListViewModel(true, false,
  { name: 'test 1', requiredBy: 'now' },
  { name: 'test 2', requiredBy: 'tomorrow' },
  { name: 'test 3', requiredBy: 'yesterday' }
));
routingMap.addRoute('DataGrid', 'Data Grid', (state: any) => {
  let viewModel = new DataGridViewModel(undefined, undefined, false,
    { name: 'test 1', requiredBy: 'now' },
    { name: 'test 2', requiredBy: 'tomorrow' },
    { name: 'test 3', requiredBy: 'yesterday' }
  );
  viewModel.pager.limit(10);
  return viewModel;
});
routingMap.addRoute('DataGridList', 'DataGrid (List View)', (state: any) => {
  let viewModel = new DataGridViewModel<{name: string, requiredBy: string}>(
    (item, filter) => `${item.name} ${item.requiredBy}`.search(new RegExp(filter, 'i')) >= 0,
    undefined, false,
    { name: 'test 1', requiredBy: 'now' },
    { name: 'test 2', requiredBy: 'tomorrow' },
    { name: 'test 3', requiredBy: 'yesterday' }
  );
  viewModel.pager.limit(10);
  return viewModel;
});

export default routingMap;
