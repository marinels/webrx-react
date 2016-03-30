import * as wxr from '../../web.rx.react';

export interface IViewModelActivator {
  (state: any): any;
}

export interface IViewModelMap {
  [key: string]: IViewModelActivator;
}

export class RoutingMap {
  public static displayName = 'RoutingMap';

  constructor(private baseUri = '#/demo', private defaultIconName = 'flask') {
  }

  public map: IViewModelMap = {};
  public menuItems: wxr.Components.IMenuItem[] = [];

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
routingMap.addRoute('TimeSpanInput', 'Time Span Input', (state: any) => new wxr.Components.TimeSpanInputViewModel());
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
    { name: 'test 3', requiredBy: 'yesterday' }
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
    { name: 'test 3', requiredBy: 'yesterday' }
  );
  viewModel.pager.limit(10);
  return viewModel;
});
routingMap.addRoute('ModalDialog', 'Modal Dialog', (state: any) => new wxr.Components.ModalDialogViewModel('Modal Dialog Demo', 'Content...'));

export const Default = routingMap;
