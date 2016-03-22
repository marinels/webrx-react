'use strict';

import './Extensions';

import * as ConsoleLogManagerTypes from './Utils/Logging/Adapters/Console';
import * as DelegateLogManagerTypes from './Utils/Logging/Adapters/Delegate';
import * as LogManagerTypes from './Utils/Logging/LogManager';
import * as LogLevelTypes from './Utils/Logging/LogLevel';
import * as LoggerTypes from './Utils/Logging/Logger';

export namespace Logging {
  export import LogLevel = LogLevelTypes.LogLevel;
  export import ILogManager = LogManagerTypes.ILogManager;
  export import ILogger = LoggerTypes.ILogger;
  export import IMessageDelegate = LoggerTypes.IMessageDelegate;
  export import ConsoleLogManager = ConsoleLogManagerTypes.ConsoleLogManager;
  export import DelegateLogManager = DelegateLogManagerTypes.DelegateLogManager;
  export import BaseLogger = LoggerTypes.BaseLogger;

  export const initialize = LogManagerTypes.initialize;
  export const getLogger = LogManagerTypes.getLogger;
  export const getLevelName = LogLevelTypes.getLevelName;
};

import * as AlertTypes from './Utils/Alert';

export namespace Alert {
  export import Alert = AlertTypes.Alert;
  export const create = AlertTypes.default.create;
  export const createForError = AlertTypes.default.createForError;
}

import * as CompareTypes from './Utils/Compare';

export namespace Compare {
  export import IComparable = CompareTypes.IComparable;
  export import IComparer = CompareTypes.IComparer;
  export import IComparison = CompareTypes.IComparison;
  export import Comparer = CompareTypes.Comparer;
  export import SortDirection = CompareTypes.SortDirection;
  export import IFieldComparer = CompareTypes.IFieldComparer;
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

import * as PubSubTypes from './Utils/PubSub';

export namespace PubSub {
  export import ISubscriptionAction = PubSubTypes.ISubscriptionAction;
  export import ISubscriptionHandle = PubSubTypes.ISubscriptionHandle;
  export import PubSub = PubSubTypes.PubSub;

  export const publish = PubSubTypes.default.publish;
  export const subscribe = PubSubTypes.default.subscribe;
  export const unsubscribe = PubSubTypes.default.unsubscribe;
}

import * as HashCodecTypes from './Routing/HashCodec';
import * as RouteManagerTypes from './Routing/RouteManager';

export namespace Routing {
  export import HashCodec = HashCodecTypes.HashCodec;
  export import IRoute = RouteManagerTypes.IRoute;
  export import RouteManager = RouteManagerTypes.RouteManager;
}

import * as AlertCreatedTypes from './Events/AlertCreated';
import * as RouteChangedTypes from './Events/RouteChanged';
import * as RoutingStateChangedTypes from './Events/RoutingStateChanged';

export namespace Events {
  export import IAlertCreated = AlertCreatedTypes.IAlertCreated;
  export import IRouteChanged = RouteChangedTypes.IRouteChanged;
  export import IRoutingStateChanged =  RoutingStateChangedTypes.IRoutingStateChanged;

  export const AlertCreatedKey = AlertCreatedTypes.AlertCreatedKey;
  export const RouteChangedKey = RouteChangedTypes.RouteChangedKey;
  export const RoutingStateChangedKey = RoutingStateChangedTypes.RoutingStateChangedKey;
}

import * as BaseStoreTypes from './Stores/BaseStore';
import * as ObservableApiTypes from './Stores/ObservableApi';
import * as BaseSampleDataStoreTypes from './Stores/SampleData/BaseSampleDataStore';
import * as SampleDataTypes from './Stores/SampleData/SampleData';

export namespace Stores {
  export import BaseModel = BaseStoreTypes.BaseModel;
  export import BaseStore = BaseStoreTypes.BaseStore;
  export import ObservableApi = ObservableApiTypes.ObservableApi;
  export import ISampleDataAction = BaseSampleDataStoreTypes.ISampleDataAction;
  export import ISampleDataActionSet = BaseSampleDataStoreTypes.ISampleDataActionSet;
  export import BaseSampleDataStore = BaseSampleDataStoreTypes.BaseSampleDataStore;
  export import SampleData = SampleDataTypes.SampleData;
}

import * as BaseViewModelTypes from './Components/React/BaseViewModel';
import * as BaseRoutableViewModelTypes from './Components/React/BaseRoutableViewModel';
import * as BaseViewTypes from './Components/React/BaseView';

import * as AlertViewModelTypes from './Components/Common/Alert/AlertViewModel';
import * as AlertHostViewModelTypes from './Components/Common/Alert/AlertHostViewModel';
import * as AlertViewTypes from './Components/Common/Alert/AlertView';
import * as AlertHostViewTypes from './Components/Common/Alert/AlertHostView';

import * as BindableInputTypes from './Components/Common/BindableInput/BindableInput';

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
import * as PageHeaderViewModelTypes from './Components/Common/PageHeader/PageHeaderViewModel';
import * as PageHeaderViewTypes from './Components/Common/PageHeader/PageHeaderView';

import * as DataGridViewModelTypes from './Components/Common/DataGrid/DataGridViewModel';
import * as AsyncDataGridViewModelTypes from './Components/Common/DataGrid/AsyncDataGridViewModel';
import * as DataGridViewTypes from './Components/Common/DataGrid/DataGridView';

import * as ComponentDemoViewModelTypes from './Components/Demo/ComponentDemoViewModel';
import * as ComponentDemoViewTypes from './Components/Demo/ComponentDemoView';

import * as RoutingMapTypes from './Components/Common/App/RoutingMap';
import * as AppViewModelTypes from './Components/Common/App/AppViewModel';
import * as ViewMapTypes from './Components/Common/App/ViewMap';
import * as AppViewTypes from './Components/Common/App/AppView';

export namespace Components {
  export import IBaseViewModel = BaseViewModelTypes.IBaseViewModel;
  export import BaseViewModel = BaseViewModelTypes.BaseViewModel;
  export import IBaseRoutableViewModel = BaseRoutableViewModelTypes.IBaseRoutableViewModel;
  export import IRoutableViewModel = BaseRoutableViewModelTypes.IRoutableViewModel;
  export import IRoutedViewModel = BaseRoutableViewModelTypes.IRoutedViewModel;
  export import BaseRoutableViewModel = BaseRoutableViewModelTypes.BaseRoutableViewModel;
  export import IBaseViewProps = BaseViewTypes.IBaseViewProps;
  export import IBaseHTMLDivViewProps = BaseViewTypes.IBaseHTMLDivViewProps;
  export import BaseView = BaseViewTypes.BaseView;

  export import IAlert = AlertViewModelTypes.IAlert;
  export import AlertViewModel = AlertViewModelTypes.AlertViewModel;
  export import AlertHostViewModel = AlertHostViewModelTypes.AlertHostViewModel;
  export import AlertView = AlertViewTypes.AlertView;
  export import AlertHostView = AlertHostViewTypes.AlertHostView;

  export import BindableInput = BindableInputTypes.BindableInput;

  export import ContextMenu = ContextMenuTypes.ContextMenu;

  export import Loading = LoadingTypes.Loading;

  export import Splash = SplashTypes.Splash;

  export import ProfilePicture = ProfilePictureTypes.ProfilePicture;

  export import PageFooterViewModel = PageFooterViewModelTypes.PageFooterViewModel;
  export import PageFooterView = PageFooterViewTypes.PageFooterView;

  export import DialogResult = ModalDialogViewModelTypes.DialogResult;
  export import IValidatable = ModalDialogViewModelTypes.IValidatable;
  export import ModalDialogViewModel = ModalDialogViewModelTypes.ModalDialogViewModel;
  export import ModalDialogView = ModalDialogViewTypes.ModalDialogView;

  export import IViewModelActivator = RouteHandlerViewModelTypes.IViewModelActivator;
  export import IRoutingMap = RouteHandlerViewModelTypes.IRoutingMap;
  export import RouteHandlerViewModel = RouteHandlerViewModelTypes.RouteHandlerViewModel;
  export import IViewMap = RouteHandlerViewTypes.IViewMap;
  export import RouteHandlerView = RouteHandlerViewTypes.RouteHandlerView;

  export import ITimeSpanUnit = TimeSpanInputViewModelTypes.ITimeSpanUnit;
  export import TimeSpanUnitType = TimeSpanInputViewModelTypes.TimeSpanUnitType;
  export import TimeSpanInputViewModel = TimeSpanInputViewModelTypes.TimeSpanInputViewModel;
  export import TimeSpanInputView = TimeSpanInputViewTypes.TimeSpanInputView;

  export import SearchViewModel = SearchViewModelTypes.SearchViewModel;
  export import SearchView = SearchViewTypes.SearchView;

  export import ISelectableItem = ListViewModelTypes.ISelectableItem;
  export import ListViewModel = ListViewModelTypes.ListViewModel;
  export import IListView = ListViewTypes.IListView;
  export import StandardListView = ListViewTypes.StandardListView;
  export import TreeListView = ListViewTypes.TreeListView;
  export import ListView = ListViewTypes.ListView;

  export import PagerViewModel = PagerViewModelTypes.PagerViewModel;
  export import PagerView = PagerViewTypes.PagerView;

  export import TabsViewModel = TabsViewModelTypes.TabsViewModel;
  export import ITab = TabsViewTypes.ITab;
  export import TabsView = TabsViewTypes.TabsView;

  export import IBaseAction = ActionTypes.IBaseAction;
  export import ICommandAction = ActionTypes.ICommandAction;
  export import IMenu = ActionTypes.IMenu;
  export import IMenuItem = ActionTypes.IMenuItem;
  export import PageHeaderViewModel = PageHeaderViewModelTypes.PageHeaderViewModel;
  export import PageHeaderView = PageHeaderViewTypes.PageHeaderView;

  export import DataGridViewModel = DataGridViewModelTypes.DataGridViewModel;
  export import IAsyncDataSource = AsyncDataGridViewModelTypes.IAsyncDataSource;
  export import AsyncDataGridViewModel = AsyncDataGridViewModelTypes.AsyncDataGridViewModel;
  export import DataGridColumn = DataGridViewTypes.DataGridColumn;
  export import IDataGridView = DataGridViewTypes.IDataGridView;
  export import DataGridListView = DataGridViewTypes.DataGridListView;
  export import DataGridTableView = DataGridViewTypes.DataGridTableView;
  export import DataGridView = DataGridViewTypes.DataGridView;

  export import ComponentDemoViewModel = ComponentDemoViewModelTypes.ComponentDemoViewModel;
  export import ComponentDemoView = ComponentDemoViewTypes.ComponentDemoView;

  export import RoutingMap = RoutingMapTypes.RoutingMap;
  export import IAppConfig = AppViewModelTypes.IAppConfig;
  export import AppViewModel = AppViewModelTypes.AppViewModel;
  export import ViewMap = ViewMapTypes.ViewMap;
  export import AppView = AppViewTypes.AppView;
}
