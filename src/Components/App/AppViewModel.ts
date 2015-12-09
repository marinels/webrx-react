'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import AlertHostViewModel from '../Common/Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { IMenu, IMenuItem, IAction } from '../Common/PageHeader/Actions';
import PageFooterViewModel from '../Common/PageFooter/PageFooterViewModel';
import SearchViewModel from '../Common/Search/SearchViewModel';

import { RouteHandlerViewModel, IRoutingMap } from '../Common/RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';

export interface IAppConfig {
  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  constructor(public routeManager?: RouteManager, config = <IAppConfig>{}) {
    super();

    this.config = config;

    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
    }
  }

  public config: IAppConfig;
  public alerts = new AlertHostViewModel();
  public routeHandler: RouteHandlerViewModel;
  public header = new PageHeaderViewModel(
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
  public footer = new PageFooterViewModel();
}

export default AppViewModel;
