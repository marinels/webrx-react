import * as wx from 'webrx';

import { Alert } from '../../Utils';
import { HeaderMenu, HeaderMenuItem } from '../React';
import * as Components from '../Common';

export interface ViewModelActivator {
  (state: any): any;
}

export interface ViewModelActivatorMap {
  [key: string]: ViewModelActivator;
}

export interface MenuMap {
  [key: string]: HeaderMenu;
}

export class RoutingMap {
  public static displayName = 'RoutingMap';

  public viewModelMap: ViewModelActivatorMap = {};
  public menuMap: MenuMap = {};

  constructor(private baseUri = '#/demo', private defaultIconName = 'flask') {
  }

  public addRoute(menuName: string, path: string, name: string, activator: ViewModelActivator, uri?: string, iconName?: string) {
    this.viewModelMap[path] = activator;
    const menu = this.menuMap[menuName] = this.menuMap[menuName] || <HeaderMenu>{
      id: menuName,
      header: `${menuName} Demos`,
      items: [],
    };
    menu.items.push(<HeaderMenuItem>{ id: path, header: name, uri: this.getUri(path, uri), iconName: iconName || this.defaultIconName, order: menu.items.length });
  }

  public getUri(path: string, uri: string) {
    return `${this.baseUri}/${uri || path}`;
  }

  public get menus() {
    return Object.getOwnPropertyNames(this.menuMap)
      .map(x => this.menuMap[x]);
  }
}

const routeMap = new RoutingMap();

const sampleListData = [
  { name: 'test 1', requiredBy: 'now' },
  { name: 'test 2', requiredBy: 'tomorrow' },
  { name: 'test 3', requiredBy: 'yesterday' },
  { name: 'test 4', requiredBy: 'test4' },
  { name: 'test 5', requiredBy: 'test5' },
  { name: 'test 6', requiredBy: 'test6' },
  { name: 'test 7', requiredBy: 'test7' },
  { name: 'test 8', requiredBy: 'test8' },
  { name: 'test 9', requiredBy: 'test9' },
  { name: 'test 10', requiredBy: 'test10' },
  { name: 'test 11', requiredBy: 'test11' },
];

const sampleTreeData = sampleListData
  .map(x => Object
    .assign({
      items: sampleListData
        .slice(0, 3)
        .map(y => Object
          .assign({
            items: sampleListData
              .slice(0, 3)
              .map(z => Object.assign({}, z)),
          }, y)
        ),
    }, x)
  );

routeMap.addRoute('Framework', 'Loading', 'Loading', (state: any) => 'Loading');
routeMap.addRoute('Framework', 'SizedLoading', 'Sized Loading', (state: any) => 'SizedLoading');
routeMap.addRoute('Framework', 'Splash', 'Splash', (state: any) => 'Splash');
routeMap.addRoute('Framework', 'CommandButton', 'Command Button', (state: any) => 'CommandButton');
routeMap.addRoute('Framework', 'Alert', 'Alert', (state: any) => 'Alert');
routeMap.addRoute('Framework', 'TimeSpanInput', 'Time Span Input', (state: any) => new Components.TimeSpanInputViewModel(true, Components.TimeSpanUnitType.Seconds));
routeMap.addRoute('Framework', 'ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
routeMap.addRoute('Framework', 'ProfilePicture', 'Profile Picture', (state: any) => 'ProfilePicture');
routeMap.addRoute('Framework', 'List', 'List', (state: any) => new Components.ListViewModel(wx.property(sampleListData), false, false));
routeMap.addRoute('Framework', 'Tree', 'Tree', (state: any) => new Components.ListViewModel(wx.property(sampleTreeData), true, false));
routeMap.addRoute('Framework', 'PanelList', 'Panel List', (state: any) => new Components.ListViewModel(wx.property(sampleListData), true, false));
routeMap.addRoute('Framework', 'DataGrid', 'Data Grid', (state: any) => Components.DataGridViewModel.create(...sampleListData));
routeMap.addRoute('Framework', 'DataGridAutoCol', 'Data Grid (Automatic Columns)', (state: any) => Components.DataGridViewModel.create(...sampleListData));
routeMap.addRoute('Framework', 'DataGridList', 'DataGrid (List View)', (state: any) =>
  new Components.DataGridViewModel(wx.property(sampleListData), (item, regex) => `${item.name} ${item.requiredBy}`.search(regex) >= 0)
);
routeMap.addRoute('Framework', 'ModalDialog', 'Modal Dialog', (state: any) => {
  // we are simulating a modal being contained within another view model
  return {
    displayName: 'ModalDialogViewModel',
    viewModel: new Components.ModalDialogViewModel(),
    accept: wx.command(x => Alert.create('Modal Accepted', 'Modal Closed...', 'success')),
    reject: wx.command(x => Alert.create('Modal Rejected', 'Modal Closed...', 'danger')),
  };
});
routeMap.addRoute('Framework', 'Tabs', 'Tabs', (state: any) => new Components.TabsViewModel());
routeMap.addRoute('Framework', 'StaticTabs', 'Static Tabs', (state: any) => new Components.TabsViewModel());
routeMap.addRoute('Framework', 'CommonPanel', 'Common Panel', (state: any) => 'CommonPanel');
routeMap.addRoute('Framework', 'CommonPanelList', 'Common Panel (List)', (state: any) => 'CommonPanelList');
routeMap.addRoute('Framework', 'ItemListPanel', 'Item List Panel', (state: any) => new Components.ItemListPanelViewModel(wx.property([
  { name: 'test 1', requiredBy: 'now' },
  { name: 'test 2', requiredBy: 'tomorrow' },
  { name: 'test 3', requiredBy: 'yesterday' },
]), (x, r) => r.test(x.name)));

export const RouteMap = routeMap;
