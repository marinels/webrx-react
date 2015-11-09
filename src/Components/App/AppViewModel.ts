'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import AlertHostViewModel from '../Alert/AlertHostViewModel';
import { RouteHandlerViewModel, IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';
import { PageHeaderViewModel, IMenuItem } from '../PageHeader/PageHeaderViewModel';
import PageFooterViewModel from '../PageFooter/PageFooterViewModel';

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

    let menuItems: IMenuItem[] = [
      { title: 'Home', uri: '#/', glyph: 'home' },
    ];

    this.config = config;

    ObservableApi.EnableStoreApiDebugging = config.EnableViewModelDebugging === true;
    BaseViewModel.EnableViewModelDebugging = config.EnableViewModelDebugging === true;

    this.alerts = new AlertHostViewModel();

    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
      RouteManager.EnableRouteDebugging = config.EnableRouteDebugging === true;
    }

    this.header = new PageHeaderViewModel(menuItems);
    this.footer = new PageFooterViewModel()
  }

  public config: IAppConfig;
  public alerts: AlertHostViewModel;
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer: PageFooterViewModel;
}

export default AppViewModel;
