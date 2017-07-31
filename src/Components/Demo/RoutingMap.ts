import { Observable } from 'rxjs';
import * as moment from 'moment';

import { wx } from '../../WebRx';
import { Alert, Compare } from '../../Utils';
import { HeaderMenu, HeaderCommandAction } from '../React';
import * as Components from '../Common';
import { TodoListViewModel } from './TodoList/TodoListViewModel';
import { RouteMap as AppRouteMap } from '../../Routing/RoutingMap';
import { ComponentDemoViewModel, RoutingMap } from './ComponentDemoViewModel';

export const demoRoutingMap = new RoutingMap();

export interface SampleData {
  id: number;
  name: string;
  requiredBy: string;
}

export interface SampleTreeData extends SampleData, Components.HierarchicalItemsSource<SampleTreeData> {
}

const sampleListData = <SampleData[]>[
  { cat: 'test', name: 'test 1', requiredBy: 'now' },
  { cat: 'test', name: 'test 2', requiredBy: 'tomorrow' },
  { cat: 'test', name: 'test 3', requiredBy: 'yesterday' },
  { cat: 'test', name: 'test 4', requiredBy: 'test4' },
  { cat: 'test', name: 'test 5', requiredBy: 'test5' },
  { cat: 'test', name: 'test 6', requiredBy: 'test6' },
  { cat: 'test', name: 'test 7', requiredBy: 'test7' },
  { cat: 'test', name: 'test 8', requiredBy: 'test8' },
  { cat: 'test', name: 'test 9', requiredBy: 'test9' },
  { cat: 'test', name: 'test 10', requiredBy: 'test10' },
  { cat: 'test', name: 'test 11', requiredBy: 'test11' },
].map((x, i) => Object.assign<SampleData>(x, { id: i + 1 }));

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
          }, y),
        ),
    }, x),
  );

interface SampleDataSourceRequest extends Components.ProjectionRequest {
  type: string;
}

const sampleDataSource = <Components.AsyncDataSource<SampleDataSourceRequest, Components.ProjectionResult<SampleData>>>{
    requests: <Observable<SampleDataSourceRequest>>Observable
      .timer(2000, 10000)
      .map(x => {
        if (x === 2) {
          // this will kill this request stream (no longer functional)
          throw new Error('Simulated Request Stream Error');
        }

        return {
          type: `param ${ x }`,
        };
      })
      .do(x => {
        Alert.create('Input Param Changed', `type = ${ x.type }`, undefined, 1000);
      }),
    getResultAsync: (request) => {
      if (request.filter === 'throw') {
        throw new Error('Simulated Coding Error');
      }

      return Observable
        .of(sampleListData)
        // simulate async result delay
        .delay(2000)
        .do(() => {
          const msg = [
            'Simulating Async Data Result...',
            `type = ${ request.type }`,
            `filter = ${ request.filter }`,
            `offset = ${ request.offset }`,
            `limit = ${ request.limit }`,
            `sortField = ${ request.sortField }`,
            `sortDirection = ${ request.sortDirection == null ? '' : Compare.SortDirection[request.sortDirection] }`,
          ].join('<br/>');
          Alert.create(msg, 'Async DataGrid Demo', undefined, 1000);
        })
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

          const offset = request.offset || 0;
          if (offset > 0) {
            query = query.skip(offset);
          }

          const limit = request.limit || 0;
          if (limit > 0) {
            query = query.take(limit);
          }

          const items = query.toArray();

          return <Components.ProjectionResult<SampleData>>{
            items,
            count,
          };
        });
    },
  };

demoRoutingMap.addRoute('React', 'Loading', 'Loading', (state: any) => 'Loading');
demoRoutingMap.addRoute('React', 'SizedLoading', 'Sized Loading', (state: any) => 'SizedLoading');
demoRoutingMap.addRoute('React', 'Splash', 'Splash', (state: any) => 'Splash');
demoRoutingMap.addRoute('React', 'CommandButton', 'Command Button', (state: any) => 'CommandButton');
demoRoutingMap.addRoute('React', 'Alert', 'Alert', (state: any) => 'Alert');
demoRoutingMap.addRoute('React', 'ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
demoRoutingMap.addRoute('React', 'ProfilePicture', 'Profile Picture', (state: any) => 'ProfilePicture');
demoRoutingMap.addRoute('React', 'CommonPanel', 'Common Panel', (state: any) => 'CommonPanel');
demoRoutingMap.addRoute('React', 'CommonPanelList', 'Common Panel (List)', (state: any) => 'CommonPanelList');
demoRoutingMap.addRoute('React', 'CommonPanelTable', 'Common Panel (Table)', (state: any) => 'CommonPanelTable');
demoRoutingMap.addRoute('React', 'CommonPanelTest', 'Common Panel (Test)', (state: any) => 'CommonPanelTest');
demoRoutingMap.addRoute('React', 'ObservableWrapper', 'Observable Wrapper', (state: any) => 'ObservableWrapper');

demoRoutingMap.addRoute('webrx-react', 'Search', 'Search', (state: any) => new Components.SearchViewModel());
demoRoutingMap.addRoute('webrx-react', 'TimeSpanInput', 'Time Span Input', (state: any) => new Components.TimeSpanInputViewModel(true, Components.TimeSpanUnitType.Seconds));
demoRoutingMap.addRoute('webrx-react', 'List', 'List', (state: any) => new Components.ListViewModel(Observable.of(sampleListData), false, false));
demoRoutingMap.addRoute('webrx-react', 'ListCmd', 'List (Command)', (state: any) => new Components.ListViewModel(Observable.of(sampleListData), false, false));
demoRoutingMap.addRoute('webrx-react', 'Tree', 'Tree', (state: any) => new Components.ListViewModel(wx.property(sampleTreeData), true, false));
demoRoutingMap.addRoute('webrx-react', 'PanelList', 'Panel List', (state: any) => new Components.ListViewModel(wx.property(sampleListData), true, false));
demoRoutingMap.addRoute('webrx-react', 'DataGrid', 'Data Grid', (state: any) => {
  const prop = wx.property<SampleData[]>(undefined, false);

  // simulate delayed loading
  Observable
    .of(sampleListData)
    .delay(2000)
    .do(() => {
      Alert.create('Simulating Delay', 'Delayed Observable Property List Loading', undefined, 1000);
    })
    .subscribe(x => {
      prop.value = x;
    });

  return new Components.DataGridViewModel(prop, (item, regex) => `${ item.name } ${ item.requiredBy }`.search(regex) >= 0);
});
demoRoutingMap.addRoute('webrx-react', 'DataGridAutoCol', 'Data Grid (Automatic Columns)', (state: any) => Components.DataGridViewModel.create(...sampleListData));
demoRoutingMap.addRoute('webrx-react', 'DataGridList', 'DataGrid (List View)', (state: any) =>
  new Components.DataGridViewModel(Observable.of(sampleListData), (item, regex) => `${ item.name } ${ item.requiredBy }`.search(regex) >= 0, undefined, undefined, undefined, undefined, 0),
);
demoRoutingMap.addRoute('webrx-react', 'DataGridPager', 'DataGrid (Custom Pager)', (state: any) =>
  new Components.DataGridViewModel(Observable.of(sampleListData)),
);
demoRoutingMap.addRoute('webrx-react', 'AsyncDataGrid', 'DataGrid (Async)', (state: any) => {
  return new Components.AsyncDataGridViewModel(sampleDataSource, true, true);
});
demoRoutingMap.addRoute('webrx-react', 'DataGridRoutingState', 'DataGrid (Routing State)', (state: any) =>
  new Components.DataGridViewModel(Observable.of(sampleListData), (item, regex) => `${ item.name } ${ item.requiredBy }`.search(regex) >= 0, undefined, undefined, undefined, undefined, undefined, undefined, true),
);
demoRoutingMap.addRoute('webrx-react', 'ModalDialog', 'Modal Dialog', (state: any) => {
  const createContext = wx.command<string>(x => `[${ moment().format() }] ${ x }`);
  // we are simulating a modal being contained within another view model
  return {
    displayName: 'ModalDialogViewModel',
    viewModel: new Components.ModalDialogViewModel(createContext.results),
    createContext,
    accept: wx.command(x => Alert.create(x, 'Modal Accepted', 'success')),
    reject: wx.command(x => Alert.create(x, 'Modal Rejected', 'danger')),
  };
});
demoRoutingMap.addRoute('webrx-react', 'Tabs', 'Tabs', (state: any) => new Components.TabsViewModel());
demoRoutingMap.addRoute('webrx-react', 'StaticTabs', 'Static Tabs', (state: any) => new Components.TabsViewModel());
demoRoutingMap.addRoute('webrx-react', 'ItemListPanel', 'Item List Panel', (state: any) =>
  new Components.ItemListPanelViewModel(wx.property(sampleListData), (x, r) => r.test(x.name), 'id'),
);
demoRoutingMap.addRoute('webrx-react', 'ListItemListPanel', 'Item List Panel (List)', (state: any) =>
  new Components.ItemListPanelViewModel(Observable.of(sampleListData), (x, r) => r.test(x.name)),
);
demoRoutingMap.addRoute('webrx-react', 'TreeItemListPanel', 'Item List Panel (Tree)', (state: any) => {
  return new Components.ItemListPanelViewModel(Observable.of(sampleTreeData), (node, regexp) => {
    return Components.filterHierarchical(node, regexp, x => regexp.test(x.name));
  }, undefined, undefined, undefined, undefined, 0);
});
demoRoutingMap.addRoute('webrx-react', 'AsyncItemListPanel', 'ItemListPanel (Async)', (state: any) => {
  return new Components.AsyncItemListPanelViewModel(sampleDataSource, true, true);
});
demoRoutingMap.addRoute('webrx-react', 'InlineEdit', 'InlineEdit', (state: any) => {
  const editor = new Components.InlineEditViewModel(5);

  editor.save.results
    // handle post-save results
    .subscribe(x => {
      Alert.create(`Saving value change: ${ x }`, 'Inline Editor Demo');
    });

  return editor;
});
demoRoutingMap.addRoute('webrx-react', 'InlineEditObject', 'InlineEdit (Object)', (state: any) => {
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
        else if (x.rank === 8) {
          throw new Error('Manual');
        }

        return x;
      })
      .catch(x => {
        if (x.message === 'Manual') {
          editor.setError.execute(true);
          Alert.createForError(x, 'Manual Error Handling');
          return Observable.empty();
        }

        return Observable.throw(x);
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

demoRoutingMap.viewModelMap['help'] = () => 'Help';
demoRoutingMap.viewModelMap['todolist'] = () => new TodoListViewModel();

// inject the demo infrastructure into the app routing and view maps
AppRouteMap['/'] = { path: '/demo/' };
AppRouteMap['^/demo$'] = { path: '/demo/' };
// setup the demo route path pattern
AppRouteMap['^/demo/(.*)?'] = { path: '/demo', creator: () => new ComponentDemoViewModel(demoRoutingMap) };
