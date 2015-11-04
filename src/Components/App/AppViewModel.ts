'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';
import { RouteHandlerViewModel, IRoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../Routing/RouteManager';
import { PageHeaderViewModel, IMenuItem } from '../PageHeader/PageHeaderViewModel';
import PageFooterViewModel from '../PageFooter/PageFooterViewModel';
import AlertViewModel from '../Alert/AlertViewModel';
import { default as PubSub, ISubscriptionHandle } from '../../Utils/PubSub';
import { AlertCreatedKey, IAlertCreated } from '../../Events/AlertCreated';

export interface IAppConfig {
  EnableViewModelDebugging?: boolean;
  EnableViewDebugging?: boolean;
  EnableRouteDebugging?: boolean;
  EnableStoreDebugging?: boolean;

  routingMap: IRoutingMap;
}

export class AppViewModel extends BaseViewModel {
  constructor(public routeManager?: RouteManager, config = <IAppConfig>{}) {
    super();

    let menuItems: IMenuItem[] = [
      { title: 'Home', uri: '#/', glyph: 'home' },
    ];

    this.config = config;

    BaseViewModel.EnableViewModelDebugging = config.EnableViewModelDebugging === true;

    if (routeManager != null) {
      this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);
      RouteManager.EnableRouteDebugging = config.EnableRouteDebugging === true;
    }

    this.header = new PageHeaderViewModel(menuItems);
    this.footer = new PageFooterViewModel()
  }

  private currentAlertKey = 0;

  private alertCreatedHandle: ISubscriptionHandle;

  public config: IAppConfig;
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer: PageFooterViewModel;
  public alerts = wx.list<AlertViewModel>();

  private appendAlert(text: string, header?: string, style?: string, timeout?: number) {
    let alert = new AlertViewModel(this.alerts, ++this.currentAlertKey, text, header, style, timeout);

    this.alerts.add(alert);

    return alert;
  }

  initialize() {
    super.initialize();

    this.alertCreatedHandle = PubSub.subscribe<IAlertCreated>(AlertCreatedKey, x => this.appendAlert(x.text, x.header, x.style, x.timeout));
  }

  cleanup() {
    super.cleanup();

    this.alertCreatedHandle = PubSub.unsubscribe(this.alertCreatedHandle);
  }
}

export default AppViewModel;
