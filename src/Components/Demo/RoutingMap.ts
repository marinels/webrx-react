import { Iterable } from 'ix';
import { Observable } from 'rxjs';
import * as moment from 'moment';

import { wx } from '../../WebRx';
import { Alert, Compare } from '../../Utils';
import * as Components from '../Common';
import { TodoListViewModel } from './TodoList/TodoListViewModel';
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

export function createSampleItem(
  cat: string,
  name: string,
  requiredBy: string,
  id = 0,
): SampleData {
  return {
    id,
    cat,
    name,
    requiredBy,
  };
}

export function cloneSampleItem<T extends SampleData>(item: T) {
  return <T>createSampleItem(item.cat, item.name, item.requiredBy, item.id);
}

export function cloneSampleTreeItem(item: SampleTreeData, items: Iterable<SampleTreeData>) {
  item = cloneSampleItem(item);

  item.items = items
    .toArray();

  return item;
}

export const sampleListData: Array<SampleData> = [
  createSampleItem('item', 'test 1', 'now'),
  createSampleItem('item', 'test 2', 'tomorrow'),
  createSampleItem('item', 'test 3', 'yesterday'),
  createSampleItem('test', 'test 4', 'test4'),
  createSampleItem('test', 'test 5', 'test5'),
  createSampleItem('test', 'test 6', 'test6'),
  createSampleItem('test', 'test 7', 'test7'),
  createSampleItem('test', 'test 8', 'test8'),
  createSampleItem('test', 'test 9', 'test9'),
  createSampleItem('test', 'test 10', 'test10'),
  createSampleItem('test', 'test 11', 'test11'),
].map((x, i) => Object.assign(x, { id: i + 1 }));

export const sampleTreeData: Array<SampleTreeData> = sampleListData
  .map(x => Object
    .assign({
      items: sampleListData
        .slice(0, 3)
        .map(y => Object
          .assign({
            items: sampleListData
              .slice(0, 3)
              .map(z => Object.assign({}, z, { name: x.name + ' (2)' })),
          }, y, { name: x.name + ' (1)' }),
        ),
    }, x, { name: x.name + ' (0)' }),
  );

function sampleDataSource<TContext = any>(request: Components.DataSourceRequest<TContext> | undefined) {
  if (request == null) {
    return undefined;
  }

  const search = Components.ItemListPanelViewModel.getSearchRequest(request);

  if (search != null && search.filter === 'throw') {
    throw new Error('Simulated Coding Error');
  }

  return Observable
    .of(sampleListData)
    .map(data => ({
      data,
      page: request.page,
      sort: request.sort,
      context: request.context,
    }))
    .do(x => {
      const msg = [
        'Simulating Async Data Result...',
        `page = ${ String.stringify(x.page) }`,
        `sort = ${ String.stringify(x.sort) }`,
        `context = ${ String.stringify(x.context) }`,
      ].join('<br/>');
      Alert.create(msg, 'Async Data Source Demo', undefined, 2000);
    })
    // simulate async result delay
    .delay(2000)
    .map(x => {
      let query = x.data
        .asIterable();

      if (search != null) {
        if (search.filter === 'error') {
          throw new Error('Simulated Async Data Source Error');
        }

        query = query
          .filter(y => {
            return (
              y.name.indexOf(search.filter || '') >= 0 ||
              y.requiredBy.indexOf(search.filter || '') >= 0
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

function sampleTreeDataSource<TContext = any>(request: Components.DataSourceRequest<TContext> | undefined) {
  if (request == null) {
    return undefined;
  }

  const search = Components.ItemListPanelViewModel.getSearchRequest(request);

  if (search != null && search.filter === 'throw') {
    throw new Error('Simulated Coding Error');
  }

  return Observable
    .of(sampleTreeData)
    .map(data => ({
      data,
      context: request.context,
    }))
    .do(x => {
      const msg = [
        'Simulating Async Data Result...',
        `context = ${ String.stringify(x.context) }`,
      ].join('<br/>');
      Alert.create(msg, 'Async Data Source Demo', undefined, 2000);
    })
    // simulate async result delay
    .delay(2000)
    .map(x => {
      let query = x.data
        .asIterable();

      if (search != null) {
        if (search.filter === 'error') {
          throw new Error('Simulated Async Data Source Error');
        }

        query = Components.filterTreeItems(
          query,
          y => y.items,
          (y, i) => cloneSampleTreeItem(y, i),
          y => {
            return (
              y.name.indexOf(search.filter || '') >= 0 ||
              y.requiredBy.indexOf(search.filter || '') >= 0
            );
          },
        );
      }

      const count = query.count();

      const items = query.toArray();

      return <Components.DataSourceResponse<SampleTreeData>>{
        items,
        count,
      };
    });
}

demoRoutingMap.addRoute('React', 'Loading', 'Loading', (state: any) => 'Loading');
demoRoutingMap.addRoute('React', 'SizedLoading', 'Sized Loading', (state: any) => 'SizedLoading');
demoRoutingMap.addRoute('React', 'Splash', 'Splash', (state: any) => 'Splash');
demoRoutingMap.addRoute('React', 'CommandButton', 'Command Button', (state: any) => 'CommandButton');
demoRoutingMap.addRoute('React', 'CommandButtonCondition', 'Command Button (condition)', (state: any) => {
  const condition = Components.CommandButton.wx.property(0);
  const cmd = Components.CommandButton.wx.command(
    x => {
      return ++condition.value;
    },
    condition.changed,
    (c, x) => {
      return x == null || c <= x;
    },
    condition.value,
  );

  return {
    displayName: 'CommandButtonCondition',
    condition,
    cmd,
  };
});
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
demoRoutingMap.addRoute('React', 'ContentTooltip', 'Content Tooltip', (state: any) => 'ContentTooltip');
demoRoutingMap.addRoute('React', 'NavButton', 'Nav Button', (state: any) => 'NavButton');
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
demoRoutingMap.addRoute('React', 'TimeSpanInput', 'Time Span Input', (state: any) => 'TimeSpanInput');

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
demoRoutingMap.addRoute('webrx-react', 'ListItemsTree', 'ListItems (Tree)', (state: any) => new Components.TreeListItemsViewModel(sampleTreeData, x => x.items));
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
demoRoutingMap.addRoute('webrx-react', 'ItemListPanel', 'Item List Panel', (state: any) =>
  new Components.ItemListPanelViewModel(sampleListData, (x, s) => s.regex.test(x.name)),
);
demoRoutingMap.addRoute('webrx-react', 'ItemListPanelList', 'Item List Panel (List)', (state: any) =>
  new Components.ItemListPanelViewModel(sampleListData, (x, s) => s.regex.test(x.name)),
);
demoRoutingMap.addRoute('webrx-react', 'ItemListPanelTree', 'Item List Panel (Tree)', (state: any) =>
  new Components.TreeItemListPanelViewModel(sampleTreeData, x => x.items, (x, items) => cloneSampleTreeItem(x, items), (x, s) => s.regex.test(x.name)),
);
demoRoutingMap.addRoute('webrx-react', 'AsyncItemListPanel', 'ItemListPanel (Async)', (state: any) => {
  return new Components.AsyncItemListPanelViewModel(sampleDataSource);
});
demoRoutingMap.addRoute('webrx-react', 'AsyncItemListPanelTree', 'ItemListPanel (Async Tree)', (state: any) => {
  return new Components.AsyncTreeItemListPanelViewModel(sampleTreeDataSource, x => x.items);
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
demoRoutingMap.addRoute('webrx-react', 'todolist', 'Todo List', (state: any) => {
  return new TodoListViewModel();
});

// inject the demo infrastructure into the app routing and view maps
AppRouteMap['/'] = { path: '/demo/' };
AppRouteMap['^/demo$'] = { path: '/demo/' };
// setup the demo route path pattern
AppRouteMap['^/demo/(.*)?'] = { path: '/demo', creator: () => new ComponentDemoViewModel(demoRoutingMap) };
