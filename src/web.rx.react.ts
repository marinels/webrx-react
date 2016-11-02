// tslint:disable:no-unused-variable

function exportFunction<T extends Function>(item: T, thisArg: any = null): T {
  return <T><Function>function() {
    item.apply(thisArg, arguments);
  };
}

import './Extensions';

import * as ConsoleLogManagerTypes from './Utils/Logging/Adapters/Console';
import * as DelegateLogManagerTypes from './Utils/Logging/Adapters/Delegate';
import * as LogManagerTypes from './Utils/Logging/LogManager';
import * as LogLevelTypes from './Utils/Logging/LogLevel';
import * as LoggerTypes from './Utils/Logging/Logger';

export namespace Logging {
  export import LogLevel = LogLevelTypes.LogLevel;
  export import LogManager = LogManagerTypes.LogManager;
  export import Logger = LoggerTypes.Logger;
  export import MessageDelegate = LoggerTypes.MessageDelegate;
  export import ConsoleLogManager = ConsoleLogManagerTypes.ConsoleLogManager;
  export import DelegateLogManager = DelegateLogManagerTypes.DelegateLogManager;
  export import DelegateLogger = DelegateLogManagerTypes.DelegateLogger;
  export import BaseLogger = LoggerTypes.BaseLogger;

  export const initialize = LogManagerTypes.initialize;
  export const getLogger = LogManagerTypes.getLogger;
  export const getLevelName = LogLevelTypes.getLevelName;
};

import * as PubSubTypes from './Utils/PubSub';

export namespace PubSub {
  export import PubSub = PubSubTypes.PubSub;

  export const publish = exportFunction(PubSubTypes.Default.publish, PubSubTypes.Default);
  export const observe = exportFunction(PubSubTypes.Default.observe, PubSubTypes.Default);
  export const subscribe = exportFunction(PubSubTypes.Default.subscribe, PubSubTypes.Default);
}

import * as AlertTypes from './Utils/Alert';

export namespace Alert {
  export import Alert = AlertTypes.Alert;
  export const create = exportFunction(AlertTypes.Default.create, AlertTypes.Default);
  export const createForError = exportFunction(AlertTypes.Default.createForError, AlertTypes.Default);
}

import * as CompareTypes from './Utils/Compare';

export namespace Compare {
  export import Comparable = CompareTypes.Comparable;
  export import Comparer = CompareTypes.Comparer;
  export import ValueComparison = CompareTypes.ValueComparison;
  export import ValueComparer = CompareTypes.ValueComparer;
  export import SortDirection = CompareTypes.SortDirection;
  export import FieldComparer = CompareTypes.FieldComparer;
  export import ObjectComparer = CompareTypes.ObjectComparer;
}

import * as MomentTypes from './Utils/Moment';

export namespace Moment {
  export import TicksPerMillisecond = MomentTypes.TicksPerMillisecond;
  export import EpochOffset = MomentTypes.EpochOffset;
  export import DefaultDateTimeFormat = MomentTypes.DefaultDateTimeFormat;
  export import DefaultDateTimeOffsetFormat = MomentTypes.DefaultDateTimeOffsetFormat;
  export import DateTime = MomentTypes.DateTime;
  export import TimeSpan = MomentTypes.TimeSpan;
}

export { SubMan } from './Utils/SubMan';

import * as HashCodecTypes from './Routing/HashCodec';
import * as RouteManagerTypes from './Routing/RouteManager';

export namespace Routing {
  export import HashCodec = HashCodecTypes.HashCodec;
  export import Route = RouteManagerTypes.Route;
  export import RouteManager = RouteManagerTypes.RouteManager;
  export import Manager = RouteManagerTypes.Default;
}

import * as AlertCreatedTypes from './Events/AlertCreated';
import * as RoutingStateChangedTypes from './Events/RoutingStateChanged';

export namespace Events {
  export import AlertCreatedKey = AlertCreatedTypes.AlertCreatedKey;
  export import AlertCreated = AlertCreatedTypes.AlertCreated;

  export import RoutingStateChangedKey = RoutingStateChangedTypes.RoutingStateChangedKey;
  export import RoutingStateChanged = RoutingStateChangedTypes.RoutingStateChanged;
}

import * as BaseStoreTypes from './Stores/BaseStore';
import * as ObservableApiTypes from './Stores/ObservableApi';
import * as BaseSampleDataStoreTypes from './Stores/SampleData/BaseSampleDataStore';
import * as SampleDataTypes from './Stores/SampleData/SampleData';

export namespace Stores {
  export import BaseStore = BaseStoreTypes.BaseStore;
  export import HttpRequestMethod = ObservableApiTypes.HttpRequestMethod;
  export import ObservableApi = ObservableApiTypes.ObservableApi;
  export import SampleDataAction = BaseSampleDataStoreTypes.SampleDataAction;
  export import SampleDataActionSet = BaseSampleDataStoreTypes.SampleDataActionSet;
  export import BaseSampleDataStore = BaseSampleDataStoreTypes.BaseSampleDataStore;
  export import SampleData = SampleDataTypes.SampleData;
}

import * as BaseViewModelTypes from './Components/React/BaseViewModel';
import * as BaseRoutableViewModelTypes from './Components/React/BaseRoutableViewModel';
import * as BaseViewTypes from './Components/React/BaseView';
import * as RenderHelpers from './Components/React/RenderHelpers';
import * as BindingHelpers from './Components/React/BindingHelpers';

import * as AlertViewModelTypes from './Components/Common/Alert/AlertViewModel';
import * as AlertHostViewModelTypes from './Components/Common/Alert/AlertHostViewModel';
import * as AlertViewTypes from './Components/Common/Alert/AlertView';
import * as AlertHostViewTypes from './Components/Common/Alert/AlertHostView';

import * as BindableInputTypes from './Components/Common/BindableInput/BindableInput';

import * as CommandButtonTypes from './Components/Common/CommandButton/CommandButton';

import * as ContextMenuTypes from './Components/Common/ContextMenu/ContextMenu';

import * as LoadingTypes from './Components/Common/Loading/Loading';

import * as SplashTypes from './Components/Common/Splash/Splash';

import * as PageFooterViewModelTypes from './Components/Common/PageFooter/PageFooterViewModel';
import * as PageFooterViewTypes from './Components/Common/PageFooter/PageFooterView';

import * as ModalDialogViewModelTypes from './Components/Common/ModalDialog/ModalDialogViewModel';
import * as ModalDialogViewTypes from './Components/Common/ModalDialog/ModalDialogView';

import * as RouteHandlerViewModelTypes from './Components/Common/RouteHandler/RouteHandlerViewModel';
import * as RouteHandlerViewTypes from './Components/Common/RouteHandler/RouteHandlerView';

import * as ProfilePictureTypes from './Components/Common/ProfilePicture/ProfilePicture';

import * as TimeSpanInputViewModelTypes from './Components/Common/TimeSpanInput/TimeSpanInputViewModel';
import * as TimeSpanInputViewTypes from './Components/Common/TimeSpanInput/TimeSpanInputView';

import * as SearchViewModelTypes from './Components/Common/Search/SearchViewModel';
import * as SearchViewTypes from './Components/Common/Search/SearchView';

import * as ListViewModelTypes from './Components/Common/List/ListViewModel';
import * as ListViewTypes from './Components/Common/List/ListView';

import * as PagerViewModelTypes from './Components/Common/Pager/PagerViewModel';
import * as PagerViewTypes from './Components/Common/Pager/PagerView';

import * as TabsViewModelTypes from './Components/Common/Tabs/TabsViewModel';
import * as TabsViewTypes from './Components/Common/Tabs/TabsView';

import * as ActionTypes from './Components/Common/PageHeader/Actions';
import * as SidebarTypes from './Components/Common/PageHeader/Sidebar';
import * as PageHeaderViewModelTypes from './Components/Common/PageHeader/PageHeaderViewModel';
import * as PageHeaderViewTypes from './Components/Common/PageHeader/PageHeaderView';

import * as DataGridViewModelTypes from './Components/Common/DataGrid/DataGridViewModel';
import * as AsyncDataGridViewModelTypes from './Components/Common/DataGrid/AsyncDataGridViewModel';
import * as DataGridViewTypes from './Components/Common/DataGrid/DataGridView';

import * as CommonPanelTypes from './Components/Common/CommonPanel/CommonPanel';

import * as ItemListPanelViewModelTypes from './Components/Common/ItemListPanel/ItemListPanelViewModel';
import * as ItemListPanelViewTypes from './Components/Common/ItemListPanel/ItemListPanelView';

export namespace Components {
  export import LifecycleComponentViewModel = BaseViewModelTypes.LifecycleComponentViewModel;
  export import BaseViewModel = BaseViewModelTypes.BaseViewModel;
  export import BaseRoutableViewModel = BaseRoutableViewModelTypes.BaseRoutableViewModel;
  export import BaseViewProps = BaseViewTypes.BaseViewProps;
  export import BaseView = BaseViewTypes.BaseView;
  export import renderEnumerable = RenderHelpers.renderEnumerable;
  export import renderConditional = RenderHelpers.renderConditional;
  export import renderLoadable = RenderHelpers.renderLoadable;
  export import renderSizedLoadable = RenderHelpers.renderSizedLoadable;
  export import bindObservableToCommand = BindingHelpers.bindObservableToCommand;
  export import bindEventToProperty = BindingHelpers.bindEventToProperty;
  export import bindEventToCommand = BindingHelpers.bindEventToCommand;

  export import Alert = AlertViewModelTypes.Alert;
  export import DefaultAlertStyle = AlertViewModelTypes.DefaultStyle;
  export import DefaultAlertTimeout = AlertViewModelTypes.DefaultTimeout;
  export import AlertViewModel = AlertViewModelTypes.AlertViewModel;
  export import AlertHostViewModel = AlertHostViewModelTypes.AlertHostViewModel;
  export import AlertProps = AlertViewTypes.AlertProps;
  export import AlertView = AlertViewTypes.AlertView;
  export import AlertHostProps = AlertHostViewTypes.AlertHostProps;
  export import AlertHostView = AlertHostViewTypes.AlertHostView;

  export import BindableInputProps = BindableInputTypes.BindableInputProps;
  export import BindableInput = BindableInputTypes.BindableInput;

  export import CommandButtonProps = CommandButtonTypes.CommandButtonProps;
  export import CommandButton = CommandButtonTypes.CommandButton;

  export import ContextMenuProps = ContextMenuTypes.ContextMenuProps;
  export import ContextMenuState = ContextMenuTypes.ContextMenuState;
  export import ContextMenu = ContextMenuTypes.ContextMenu;

  export import LoadingProps = LoadingTypes.LoadingProps;
  export import Loading = LoadingTypes.Loading;

  export import SplashProps = SplashTypes.SplashProps;
  export import Splash = SplashTypes.Splash;

  export import ProfilePictureProps = ProfilePictureTypes.ProfilePictureProps;
  export import ProfilePicture = ProfilePictureTypes.ProfilePicture;

  export import ViewportDimensions = PageFooterViewModelTypes.ViewportDimensions;
  export import PageFooterViewModel = PageFooterViewModelTypes.PageFooterViewModel;
  export import PageFooterProps = PageFooterViewTypes.PageFooterProps;
  export import PageFooterView = PageFooterViewTypes.PageFooterView;

  export import ModalDialogViewModel = ModalDialogViewModelTypes.ModalDialogViewModel;
  export import ModalDialogProps = ModalDialogViewTypes.ModalDialogProps;
  export import ModalDialogView = ModalDialogViewTypes.ModalDialogView;

  export import ViewModelActivator = RouteHandlerViewModelTypes.ViewModelActivator;
  export import RoutingMap = RouteHandlerViewModelTypes.RoutingMap;
  export import RouteHandlerViewModel = RouteHandlerViewModelTypes.RouteHandlerViewModel;
  export import ViewMap = RouteHandlerViewTypes.ViewMap;
  export import RouteHandlerProps = RouteHandlerViewTypes.RouteHandlerProps;
  export import RouteHandlerView = RouteHandlerViewTypes.RouteHandlerView;

  export import TimeSpanUnitType = TimeSpanInputViewModelTypes.TimeSpanUnitType;
  export import TimeSpanUnit = TimeSpanInputViewModelTypes.TimeSpanUnit;
  export import TimeSpanUnits = TimeSpanInputViewModelTypes.TimeSpanUnits;
  export import TimeSpanInputViewModel = TimeSpanInputViewModelTypes.TimeSpanInputViewModel;
  export import TimeSpanControlProps = TimeSpanInputViewTypes.TimeSpanControlProps;
  export import TimeSpanControl = TimeSpanInputViewTypes.TimeSpanControl;
  export import TimeSpanInputProps = TimeSpanInputViewTypes.TimeSpanInputProps;
  export import TimeSpanInputView = TimeSpanInputViewTypes.TimeSpanInputView;

  export import SearchRoutingState = SearchViewModelTypes.SearchRoutingState;
  export import SearchViewModel = SearchViewModelTypes.SearchViewModel;
  export import SearchProps = SearchViewTypes.SearchProps;
  export import SearchView = SearchViewTypes.SearchView;

  export import SelectableItem = ListViewModelTypes.SelectableItem;
  export import ListViewModel = ListViewModelTypes.ListViewModel;
  export import ListViewRenderTemplate = ListViewTypes.ListViewRenderTemplate;
  export import ListViewTemplate = ListViewTypes.ListViewTemplate;
  export import TreeNode = ListViewTypes.TreeNode;
  export import TreeViewTemplate = ListViewTypes.TreeViewTemplate;
  export import ListProps = ListViewTypes.ListProps;
  export import ListView = ListViewTypes.ListView;

  export import StandardPagerLimits = PagerViewModelTypes.StandardLimits;
  export import AlwaysPagedLimits = PagerViewModelTypes.AlwaysPagedLimits;
  export import PagerRoutingState = PagerViewModelTypes.PagerRoutingState;
  export import PagerViewModel = PagerViewModelTypes.PagerViewModel;
  export import PagerProps = PagerViewTypes.PagerProps;
  export import PagerView = PagerViewTypes.PagerView;

  export import TabsRoutingState = TabsViewModelTypes.TabsRoutingState;
  export import TabsViewModel = TabsViewModelTypes.TabsViewModel;
  export import TabRenderTemplate = TabsViewTypes.TabRenderTemplate;
  export import TabsProps = TabsViewTypes.TabsProps;
  export import TabsView = TabsViewTypes.TabsView;

  export import HeaderAction = ActionTypes.HeaderAction;
  export import HeaderCommandAction = ActionTypes.HeaderCommandAction;
  export import HeaderMenu = ActionTypes.HeaderMenu;
  export import HeaderMenuItem = ActionTypes.HeaderMenuItem;
  export import SidebarProps = SidebarTypes.SidebarProps;
  export import Sidebar = SidebarTypes.Sidebar;
  export import PageHeaderViewModel = PageHeaderViewModelTypes.PageHeaderViewModel;
  export import PageHeaderProps = PageHeaderViewTypes.PageHeaderProps;
  export import PageHeaderView = PageHeaderViewTypes.PageHeaderView;

  export import SortArgs = DataGridViewModelTypes.SortArgs;
  export import DataGridRoutingState = DataGridViewModelTypes.DataGridRoutingState;
  export import DataGridViewModel = DataGridViewModelTypes.DataGridViewModel;
  export import AsyncDataSource = AsyncDataGridViewModelTypes.AsyncDataSource;
  export import AsyncDataGridViewModel = AsyncDataGridViewModelTypes.AsyncDataGridViewModel;
  export import DataGridColumnProps = DataGridViewTypes.DataGridColumnProps;
  export import DataGridColumn = DataGridViewTypes.DataGridColumn;
  export import DataGridViewTemplate = DataGridViewTypes.DataGridViewTemplate;
  export import DataGridListViewTemplate = DataGridViewTypes.DataGridListViewTemplate;
  export import DataGridTableViewTemplate = DataGridViewTypes.DataGridTableViewTemplate;
  export import DataGridProps = DataGridViewTypes.DataGridProps;
  export import DataGridView = DataGridViewTypes.DataGridView;

  export import CommonPanelProps = CommonPanelTypes.CommonPanelProps;
  export import CommonPanel = CommonPanelTypes.CommonPanel;

  export import ItemListPanelViewModel = ItemListPanelViewModelTypes.ItemListPanelViewModel;
  export import CountFooterContentProps = ItemListPanelViewTypes.CountFooterContentProps;
  export import CountFooterContent = ItemListPanelViewTypes.CountFooterContent;
  export import ViewAllFooterActionProps = ItemListPanelViewTypes.ViewAllFooterActionProps;
  export import ViewAllFooterAction = ItemListPanelViewTypes.ViewAllFooterAction;
  export import ItemListPanelProps = ItemListPanelViewTypes.ItemListPanelProps;
  export import ItemListPanelView = ItemListPanelViewTypes.ItemListPanelView;
}

import * as DemoRoutingMapTypes from './Components/Demo/RoutingMap';
import * as DemoViewMapTypes from './Components/Demo/ViewMap';
import * as ComponentDemoViewModelTypes from './Components/Demo/ComponentDemoViewModel';
import * as ComponentDemoViewTypes from './Components/Demo/ComponentDemoView';

import * as RoutingMapTypes from './Components/Common/App/RoutingMap';
import * as AppViewModelTypes from './Components/Common/App/AppViewModel';
import * as ViewMapTypes from './Components/Common/App/ViewMap';
import * as AppViewTypes from './Components/Common/App/AppView';

export namespace Components {
  export import DemoViewModelActivator = DemoRoutingMapTypes.ViewModelActivator;
  export import DemoViewModelActivatorMap = DemoRoutingMapTypes.ViewModelActivatorMap;
  export import MenuMap = DemoRoutingMapTypes.MenuMap;
  export import DemoRoutingMap = DemoRoutingMapTypes.Default;
  export import DemoViewActivator = DemoViewMapTypes.ViewActivator;
  export import DemoViewActivatorMap = DemoViewMapTypes.ViewActivatorMap;
  export import DemoViewMap = DemoViewMapTypes.Default;
  export import ComponentDemoRoutingState = ComponentDemoViewModelTypes.ComponentDemoRoutingState;
  export import ComponentDemoViewModel = ComponentDemoViewModelTypes.ComponentDemoViewModel;
  export import ComponentDemoProps = ComponentDemoViewTypes.ComponentDemoProps;
  export import ComponentDemoView = ComponentDemoViewTypes.ComponentDemoView;

  export import AppRoutingMap = RoutingMapTypes.AppRoutingMap;
  export import AppConfig = AppViewModelTypes.AppConfig;
  export import AppViewModel = AppViewModelTypes.AppViewModel;
  export import CurrentApp = AppViewModelTypes.Current;
  export import AppViewMap = ViewMapTypes.AppViewMap;
  export import AppProps = AppViewTypes.AppProps;
  export import AppView = AppViewTypes.AppView;
}
