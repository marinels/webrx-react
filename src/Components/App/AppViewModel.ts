'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { RouteHandlerViewModel, IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';

export interface IAppConfig {
  EnablePropertyChangedDebugging: boolean;
  EnableViewRenderDebugging: boolean;
  EnableRouteDebugging: boolean;
  EnableStoreApiDebugging: boolean;

  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  constructor(public routeManager: RouteManager, config = <IAppConfig>{}) {
    super();

    this.config = config;
    this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
  }

  public config: IAppConfig;
  public routeHandler: RouteHandlerViewModel;
  public alerts = wx.list<any>();
  public status = wx.property('');
}

export default AppViewModel;
