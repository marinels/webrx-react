'use strict';

import * as wx from 'webrx';
import * as moment from 'moment';

import BaseViewModel from '../../React/BaseViewModel';
import AlertHostViewModel from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { IMenu, IMenuItem, ICommandAction } from '../PageHeader/Actions';
import PageFooterViewModel from '../PageFooter/PageFooterViewModel';
import SearchViewModel from '../Search/SearchViewModel';

import { RouteHandlerViewModel, IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../../Routing/RouteManager';

export interface IAppConfig {
  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  constructor(public routeManager?: RouteManager, public config = <IAppConfig>{}) {
    super();

    this.config = config;

    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
    }

    this.header = new PageHeaderViewModel(this.routeHandler);
  }

  public alerts = new AlertHostViewModel();
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer = new PageFooterViewModel();
}

export default AppViewModel;
