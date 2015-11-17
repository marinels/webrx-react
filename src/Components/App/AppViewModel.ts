'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import AlertHostViewModel from '../Common/Alert/AlertHostViewModel';
import { PageHeaderViewModel, IMenu, IMenuItem, IAction } from '../Common/PageHeader/PageHeaderViewModel';
import PageFooterViewModel from '../Common/PageFooter/PageFooterViewModel';
import SearchViewModel from '../Common/Search/SearchViewModel';

import { RouteHandlerViewModel, IRoutingMap } from '../Common/RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';
import ObservableApi from '../../Stores/ObservableApi';

export interface IAppConfig {
  EnableViewModelDebugging?: boolean;
  EnableViewDebugging?: boolean;
  EnableRouteDebugging?: boolean;
  EnableStoreDebugging?: boolean;

  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  constructor(public routeManager?: RouteManager, config = <IAppConfig>{}) {
    super();

    this.config = config;

    ObservableApi.EnableStoreApiDebugging = config.EnableViewModelDebugging === true;
    BaseViewModel.EnableViewModelDebugging = config.EnableViewModelDebugging === true;

    this.alerts = new AlertHostViewModel();

    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
      RouteManager.EnableRouteDebugging = config.EnableRouteDebugging === true;
    }

    this.header = new PageHeaderViewModel(
      [
        { id: 'home', title: 'Home', uri: '#/', iconName: 'bs-home' },
        { id: 'root', title: 'Root', uri: '/' },
      ],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    );
    this.footer = new PageFooterViewModel();
  }

  public config: IAppConfig;
  public alerts: AlertHostViewModel;
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer: PageFooterViewModel;
}

export default AppViewModel;
