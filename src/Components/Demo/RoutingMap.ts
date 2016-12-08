import { Observable } from 'rx';
import * as wx from 'webrx';

import { Alert, Compare } from '../../Utils';
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

export interface SampleData {
  name: string;
  requiredBy: string;
}

export interface SampleTreeData extends SampleData {
  items: SampleTreeData[];
}

const sampleListData = <SampleData[]>[
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
    .assign<SampleTreeData>({
      items: sampleListData
        .slice(0, 3)
        .map(y => Object
          .assign<SampleTreeData>({
            items: sampleListData
              .slice(0, 3)
              .map(z => Object.assign<SampleTreeData>({}, z)),
          }, y)
        ),
    }, x)
  );

const sampleDataSource = <Components.AsyncDataSource<SampleData, Components.AsyncDataResult<SampleData>>>{
    getResultAsync: (request) => {
      if (request.filter === 'throw') {
        throw new Error('Simulated Coding Error');
      }

      return Observable
        .of(sampleListData)
        .doOnNext(x => {
          const msg = [
            'Simulating Async Data Request...',
            `filter = ${ request.filter }`,
            `offset = ${ request.offset }`,
            `limit = ${ request.limit }`,
            `sortField = ${ request.sortField }`,
            `sortDirection = ${ Compare.SortDirection[request.sortDirection] }`,
          ].join('<br/>');
          Alert.create(msg, 'Async DataGrid Demo', undefined, 1000);
        })
        .delay(1000)
        .map(x => {
          let query = x
            .asEnumerable();

          if (String.isNullOrEmpty(request.filter) === false) {
            if (request.filter === 'error') {
              throw new Error('Simulated Async DataSource Error');
            }

            query = query
              .filter(y => {
                return (
                  y.name.indexOf(request.filter || '') >= 0 ||
                  y.requiredBy.indexOf(request.filter || '') >= 0
                );
              });
          }

          const count = query.count();

          if (String.isNullOrEmpty(request.sortField) === false) {
            if (request.sortDirection === Compare.SortDirection.Descending) {
              query = query
                .orderByDescending(y => request.sortField === 'name' ? y.name : y.requiredBy);
            }
            else {
              query = query
                .orderBy(y => request.sortField === 'name' ? y.name : y.requiredBy);
            }
          }

          if ((request.offset || 0) > 0) {
            query = query.skip(request.offset);
          }

          if ((request.limit || 0) > 0) {
            query = query.take(request.limit);
          }

          const data = query.toArray();

          return <Components.AsyncDataResult<SampleData>>{
            data,
            count,
          };
        });
    },
  };

routeMap.addRoute('React', 'Loading', 'Loading', (state: any) => 'Loading');
routeMap.addRoute('React', 'SizedLoading', 'Sized Loading', (state: any) => 'SizedLoading');
routeMap.addRoute('React', 'Splash', 'Splash', (state: any) => 'Splash');
routeMap.addRoute('React', 'CommandButton', 'Command Button', (state: any) => 'CommandButton');
routeMap.addRoute('React', 'Alert', 'Alert', (state: any) => 'Alert');
routeMap.addRoute('React', 'ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
routeMap.addRoute('React', 'ProfilePicture', 'Profile Picture', (state: any) => 'ProfilePicture');
routeMap.addRoute('React', 'CommonPanel', 'Common Panel', (state: any) => 'CommonPanel');
routeMap.addRoute('React', 'CommonPanelList', 'Common Panel (List)', (state: any) => 'CommonPanelList');

routeMap.addRoute('WebRx-React', 'TimeSpanInput', 'Time Span Input', (state: any) => new Components.TimeSpanInputViewModel(true, Components.TimeSpanUnitType.Seconds));
routeMap.addRoute('WebRx-React', 'List', 'List', (state: any) => new Components.ListViewModel(Observable.of(sampleListData), false, false));
routeMap.addRoute('WebRx-React', 'Tree', 'Tree', (state: any) => new Components.ListViewModel(wx.property(sampleTreeData), true, false));
routeMap.addRoute('WebRx-React', 'PanelList', 'Panel List', (state: any) => new Components.ListViewModel(wx.property(sampleListData), true, false));
routeMap.addRoute('WebRx-React', 'DataGrid', 'Data Grid', (state: any) =>
  new Components.DataGridViewModel(wx.property(sampleListData), (item, regex) => `${item.name} ${item.requiredBy}`.search(regex) >= 0)
);
routeMap.addRoute('WebRx-React', 'DataGridAutoCol', 'Data Grid (Automatic Columns)', (state: any) => Components.DataGridViewModel.create(...sampleListData));
routeMap.addRoute('WebRx-React', 'DataGridList', 'DataGrid (List View)', (state: any) =>
  new Components.DataGridViewModel(Observable.of(sampleListData), (item, regex) => `${item.name} ${item.requiredBy}`.search(regex) >= 0)
);
routeMap.addRoute('WebRx-React', 'AsyncDataGrid', 'DataGrid (Async)', (state: any) => {
  return new Components.AsyncDataGridViewModel(sampleDataSource, true, true);
});
routeMap.addRoute('WebRx-React', 'ModalDialog', 'Modal Dialog', (state: any) => {
  // we are simulating a modal being contained within another view model
  return {
    displayName: 'ModalDialogViewModel',
    viewModel: new Components.ModalDialogViewModel(),
    accept: wx.command(x => Alert.create('Modal Accepted', 'Modal Closed...', 'success')),
    reject: wx.command(x => Alert.create('Modal Rejected', 'Modal Closed...', 'danger')),
  };
});
routeMap.addRoute('WebRx-React', 'Tabs', 'Tabs', (state: any) => new Components.TabsViewModel());
routeMap.addRoute('WebRx-React', 'StaticTabs', 'Static Tabs', (state: any) => new Components.TabsViewModel());
routeMap.addRoute('WebRx-React', 'ItemListPanel', 'Item List Panel', (state: any) =>
  new Components.ItemListPanelViewModel(wx.property(sampleListData), (x, r) => r.test(x.name))
);
routeMap.addRoute('WebRx-React', 'ListItemListPanel', 'Item List Panel (List)', (state: any) =>
  new Components.ItemListPanelViewModel(Observable.of(sampleListData), (x, r) => r.test(x.name))
);
routeMap.addRoute('WebRx-React', 'AsyncItemListPanel', 'ItemListPanel (Async)', (state: any) => {
  const canGetResult = Observable.of(true).delay(1000);
  const dataSource = Object.assign<Components.AsyncDataSource<SampleData, Components.AsyncDataResult<SampleData>>>({ canGetResult }, sampleDataSource);
  const vm = new Components.AsyncItemListPanelViewModel(dataSource, true, true);
  vm.grid.requestData.canExecuteObservable.take(1).invokeCommand(vm.grid.refresh);
  return vm;
});
routeMap.addRoute('WebRx-React', 'InlineEdit', 'InlineEdit', (state: any) => {
  interface SampleUser {
    name: string;
    rank: number;
  }

  const onSave = (user: SampleUser) => {
    if (user.rank === 7) {
      throw new Error('Simulated Coding Error');
    }

    return Observable.of(user)
      // simulate network delay
      .delay(1000)
      // simulate an API error
      .map(x => {
        if (x.rank === 6) {
          throw new Error('Simulated API Error');
        }

        return x;
      });
  };

  const editor = new Components.InlineEditViewModel<SampleUser>({ name: 'Some Guy', rank: 5 }, onSave);

  editor.save.results
    // handle post-save results
    .subscribe(x => {
      Alert.create(`Saving SampleUser Change: ${ JSON.stringify(x, null, 2) }`, 'Inline Editor Demo');
    });

  return editor;
});

export const RouteMap = routeMap;
