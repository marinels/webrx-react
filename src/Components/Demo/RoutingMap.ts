import * as wxr from '../../web.rx.react';

export interface IViewModelActivator {
  (state: any): any;
}

export interface IViewModelMap {
  [key: string]: IViewModelActivator;
}

export class RoutingMap {
  public static displayName = 'RoutingMap';

  public map: IViewModelMap = {};
  public menuItems: wxr.Components.IMenuItem[] = [];

  constructor(private baseUri = '#/demo', private defaultIconName = 'flask') {
  }

  public addRoute(path: string, name: string, activator: IViewModelActivator, uri?: string, iconName?: string) {
    this.map[path] = activator;
    this.menuItems.push(<wxr.Components.IMenuItem>{ id: path, header: name, uri: this.getUri(path, uri), iconName: iconName || this.defaultIconName, order: this.menuItems.length });
  }

  public getUri(path: string, uri: string) {
    return `${this.baseUri}/${uri || path}`;
  }
}

const routingMap = new RoutingMap();

routingMap.addRoute('Loading', 'Loading', (state: any) => 'Loading');
routingMap.addRoute('Splash', 'Splash', (state: any) => 'Splash');
routingMap.addRoute('Alert', 'Alert', (state: any) => 'Alert');
routingMap.addRoute('TimeSpanInput', 'Time Span Input', (state: any) => new wxr.Components.TimeSpanInputViewModel(undefined, undefined, true));
routingMap.addRoute('ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
routingMap.addRoute('ProfilePicture', 'Profile Picture', (state: any) => 'ProfilePicture');
routingMap.addRoute('List', 'List', (state: any) => new wxr.Components.ListViewModel(true, false,
  { name: 'test 1', requiredBy: 'now' },
  { name: 'test 2', requiredBy: 'tomorrow' },
  { name: 'test 3', requiredBy: 'yesterday' }
));
routingMap.addRoute('DataGrid', 'Data Grid', (state: any) => {
  let viewModel = new wxr.Components.DataGridViewModel(undefined, undefined, false,
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
    { name: 'test 11', requiredBy: 'test11' }
  );
  viewModel.pager.limit(10);
  return viewModel;
});
routingMap.addRoute('DataGridList', 'DataGrid (List View)', (state: any) => {
  let viewModel = new wxr.Components.DataGridViewModel<{name: string, requiredBy: string}>(
    (item, regex) => `${item.name} ${item.requiredBy}`.search(regex) >= 0,
    undefined, false,
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
    { name: 'test 11', requiredBy: 'test11' }
  );
  viewModel.pager.limit(10);
  return viewModel;
});
routingMap.addRoute('ModalDialog', 'Modal Dialog', (state: any) => new wxr.Components.ModalDialogViewModel('Modal Dialog Demo', 'Content...'));
routingMap.addRoute('Tabs', 'Tabs', (state: any) => new wxr.Components.TabsViewModel());

export const Default = routingMap;
