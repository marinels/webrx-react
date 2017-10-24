import { Observable } from 'rxjs';
import * as moment from 'moment';

import { wx } from '../../WebRx';
import { Alert, Compare } from '../../Utils';
import { HeaderMenu, HeaderCommandAction } from '../React';
import * as Components from '../Common';
// import { TodoListViewModel } from './TodoList/TodoListViewModel';
import { RouteMap as AppRouteMap } from '../../Routing';
import { ComponentDemoViewModel, RoutingMap } from './ComponentDemoViewModel';

export const demoRoutingMap = new RoutingMap();

export interface SampleData {
  id: number;
  cat: string;
  name: string;
  requiredBy: string;
}

export interface SampleTreeData extends SampleData {
  items?: Array<SampleTreeData>;
}

export const sampleListData = <SampleData[]>[
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

export const sampleTreeData = sampleListData
  .map(x => Object
    .assign<SampleTreeData>({
      items: sampleListData
        .slice(0, 3)
        .map(y => Object
          .assign<SampleTreeData>({
            items: sampleListData
              .slice(0, 3)
              .map(z => Object.assign<SampleTreeData>({}, z, { name: x.name + ' (2)' })),
          }, y, { name: x.name + ' (1)' }),
        ),
    }, x, { name: x.name + ' (0)' }),
  );

interface SampleDataSourceContext {
  filter: string;
}

function sampleDataSource<TContext = any>(request: Components.DataSourceRequest<TContext> | undefined) {
  if (request == null) {
    return undefined;
  }

  const context: Partial<SampleDataSourceContext> = request.context || {};

  if (context.filter === 'throw') {
    throw new Error('Simulated Coding Error');
  }

  return Observable
    .of(sampleListData)
    .map(data => ({
      data,
      page: request.page,
      sort: request.sort,
      context,
    }))
    .do(x => {
      const msg = [
        'Simulating Async Data Result...',
        `page = ${ String.stringify(x.page) }`,
        `sort = ${ String.stringify(x.sort) }`,
        `context = ${ String.stringify(x.context) }`,
      ].join('<br/>');
      Alert.create(msg, 'Async DataGrid Demo', undefined, 2000);
    })
    // simulate async result delay
    .delay(2000)
    .map(x => {
      let query = x.data
        .asIterable();

      if (!String.isNullOrEmpty(context.filter)) {
        if (context.filter === 'error') {
          throw new Error('Simulated Async DataSource Error');
        }

        query = query
          .filter(y => {
            return (
              y.name.indexOf(context.filter || '') >= 0 ||
              y.requiredBy.indexOf(context.filter || '') >= 0
            );
          });
      }

      const count = query.count();

      if (x.sort != null && x.sort.direction != null && !String.isNullOrEmpty(x.sort.field)) {
        const field = x.sort.field;

        if (x.sort.direction === Compare.SortDirection.Ascending) {
          query = query
            .orderBy((y: any) => y[field]);
        }
        else if (x.sort.direction === Compare.SortDirection.Descending) {
          query = query
            .orderByDescending((y: any) => y[field]);
        }
      }

      if (x.page != null) {
        const offset = x.page.offset || 0;
        const limit = x.page.limit || 0;

        if (offset > 0) {
          query = query.skip(offset);
        }

        if (limit > 0) {
          query = query.take(limit);
        }
      }

      const items = query.toArray();

      return <Components.DataSourceResponse<SampleData>>{
        items,
        count,
      };
    });
}

demoRoutingMap.addRoute('React', 'Loading', 'Loading', (state: any) => 'Loading');
demoRoutingMap.addRoute('React', 'SizedLoading', 'Sized Loading', (state: any) => 'SizedLoading');
demoRoutingMap.addRoute('React', 'Splash', 'Splash', (state: any) => 'Splash');
demoRoutingMap.addRoute('React', 'CommandButton', 'Command Button', (state: any) => 'CommandButton');
demoRoutingMap.addRoute('React', 'Alert', 'Alert', (state: any) => 'Alert');
demoRoutingMap.addRoute('React', 'ContextMenu', 'Context Menu', (state: any) => 'ContextMenu');
demoRoutingMap.addRoute('React', 'ProfilePicture', 'Profile Picture', (state: any) => 'ProfilePicture');
demoRoutingMap.addRoute('React', 'ItemsPanel', 'Items Panel', (state: any) => 'ItemsPanel');
demoRoutingMap.addRoute('React', 'ItemsPanelBound', 'Items Panel (Bound)', (state: any) => 'ItemsPanelBound');
demoRoutingMap.addRoute('React', 'ListGroupPanel', 'ListGroup Panel', (state: any) => 'ListGroupPanel');
demoRoutingMap.addRoute('React', 'ListGroupPanelBound', 'ListGroup Panel (Bound)', (state: any) => 'ListGroupPanelBound');
demoRoutingMap.addRoute('React', 'GridPanel', 'Grid Panel', (state: any) => 'GridPanel');
demoRoutingMap.addRoute('React', 'StackPanel', 'Stack Panel', (state: any) => 'StackPanel');
demoRoutingMap.addRoute('React', 'UniformGridPanel', 'Uniform Grid Panel', (state: any) => 'UniformGridPanel');
demoRoutingMap.addRoute('React', 'WrapPanel', 'Wrap Panel', (state: any) => 'WrapPanel');
demoRoutingMap.addRoute('React', 'TreeItem', 'Tree Item', (state: any) => 'TreeItem');
demoRoutingMap.addRoute('React', 'TreeItemPresenter', 'Tree Item Presenter', (state: any) => 'TreeItemPresenter');
demoRoutingMap.addRoute('React', 'HorizontalTreeItemPresenter', 'Tree Item Presenter (Horizontal)', (state: any) => 'HorizontalTreeItemPresenter');
demoRoutingMap.addRoute('React', 'HorizontalItemsTreeItemPresenter', 'Tree Item Presenter (Horizontal Items)', (state: any) => 'HorizontalItemsTreeItemPresenter');
demoRoutingMap.addRoute('React', 'HorizontalRootTreeItemPresenter', 'Tree Item Presenter (Horizontal Root)', (state: any) => 'HorizontalRootTreeItemPresenter');
demoRoutingMap.addRoute('React', 'CommonPanel', 'Common Panel', (state: any) => 'CommonPanel');
demoRoutingMap.addRoute('React', 'CommonPanelList', 'Common Panel (List)', (state: any) => 'CommonPanelList');
demoRoutingMap.addRoute('React', 'CommonPanelTable', 'Common Panel (Table)', (state: any) => 'CommonPanelTable');
demoRoutingMap.addRoute('React', 'CommonPanelTest', 'Common Panel (Test)', (state: any) => 'CommonPanelTest');
demoRoutingMap.addRoute('React', 'ObservableWrapper', 'Observable Wrapper', (state: any) => 'ObservableWrapper');

demoRoutingMap.addRoute('webrx-react', 'Search', 'Search', (state: any) => {
  const viewModel = new Components.SearchViewModel();

  wx
    .whenAny(viewModel.requests, x => x)
    .filterNull()
    .subscribe(x => {
      Alert.create(String.stringify(x), 'Search Requested');
    });

  return viewModel;
});
demoRoutingMap.addRoute('webrx-react', 'TimeSpanInput', 'Time Span Input', (state: any) => new Components.TimeSpanInputViewModel(true, Components.TimeSpanUnitType.Seconds));
demoRoutingMap.addRoute('webrx-react', 'ItemsList', 'Items (List)', (state: any) => new Components.ItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ItemsWrap', 'Items (Wrap)', (state: any) => new Components.ItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ItemsUGrid', 'Items (Uniform Grid)', (state: any) => new Components.ItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ItemsHStack', 'Items (Horizontal Stack)', (state: any) => new Components.ItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ItemsGrid', 'Items (Grid)', (state: any) => new Components.ItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ItemsTree', 'Items (Tree)', (state: any) => new Components.ItemsViewModel(sampleTreeData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsDefault', 'ListItems (default)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsListGroup', 'ListItems (ListGroupPanel)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsPanel', 'ListItems (Default Panel)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsUGrid', 'ListItems (Uniform Grid)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsGrid', 'ListItems (Grid)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsGridAuto', 'ListItems (Auto Grid)', (state: any) => new Components.ListItemsViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'ListItemsTree', 'ListItems (Tree)', (state: any) => new Components.TreeListItemsViewModel(x => x.items, sampleTreeData));
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
demoRoutingMap.addRoute('webrx-react', 'DataGrid', 'Data Grid', (state: any) => {
  // const prop = wx.property<SampleData[]>(undefined, false);

  // simulate delayed loading
  const delay = 2000;
  const data = Observable
    .of(sampleListData)
    .do(() => {
      Alert.create('Simulating Delay', 'Delayed Observable Property List Loading', undefined, delay);
    })
    .delay(delay);

  return new Components.DataGridViewModel(data);
});
demoRoutingMap.addRoute('webrx-react', 'DataGridAutoCol', 'Data Grid (Automatic Columns)', (state: any) => new Components.DataGridViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'DataGridNoPager', 'Data Grid (No Pager)', (state: any) => new Components.DataGridViewModel(sampleListData, null));
demoRoutingMap.addRoute('webrx-react', 'DataGridPager', 'Data Grid (Custom Pager)', (state: any) => new Components.DataGridViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'DataGridList', 'Data Grid (List View)', (state: any) => new Components.DataGridViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'DataGridUGrid', 'Data Grid (Uniform Grid Panel)', (state: any) => new Components.DataGridViewModel(sampleListData));
demoRoutingMap.addRoute('webrx-react', 'DataGridAsync', 'Data Grid (Async)', (state: any) => new Components.AsyncDataGridViewModel(sampleDataSource));
// demoRoutingMap.addRoute('webrx-react', 'ItemListPanel', 'Item List Panel', (state: any) =>
//   new Components.ItemListPanelViewModel(wx.property(sampleListData), (x, r) => r.test(x.name), 'id'),
// );
// demoRoutingMap.addRoute('webrx-react', 'ListItemListPanel', 'Item List Panel (List)', (state: any) =>
//   new Components.ItemListPanelViewModel(Observable.of(sampleListData), (x, r) => r.test(x.name)),
// );
// demoRoutingMap.addRoute('webrx-react', 'TreeItemListPanel', 'Item List Panel (Tree)', (state: any) => {
//   return new Components.ItemListPanelViewModel(Observable.of(sampleTreeData), (node, regexp) => {
//     return Components.filterHierarchical(node, regexp, x => regexp.test(x.name));
//   }, undefined, undefined, undefined, undefined, 0);
// });
// demoRoutingMap.addRoute('webrx-react', 'AsyncItemListPanel', 'ItemListPanel (Async)', (state: any) => {
//   return new Components.AsyncItemListPanelViewModel(sampleDataSource, true, true);
// });
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
// demoRoutingMap.viewModelMap['todolist'] = () => new TodoListViewModel();

// inject the demo infrastructure into the app routing and view maps
AppRouteMap['/'] = { path: '/demo/' };
AppRouteMap['^/demo$'] = { path: '/demo/' };
// setup the demo route path pattern
AppRouteMap['^/demo/(.*)?'] = { path: '/demo', creator: () => new ComponentDemoViewModel(demoRoutingMap) };
