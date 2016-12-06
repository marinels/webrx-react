import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { RouteHandlerViewModel } from '../RouteHandler/RouteHandlerViewModel';
import { RouteMap } from '../../../Routing/RoutingMap';

// inject a default route
RouteMap['/'] = { path: 'Splash' };

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public alerts: AlertHostViewModel;
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer: PageFooterViewModel;

  public isLoading: wx.IObservableReadOnlyProperty<boolean>;

  constructor(routingMap = RouteMap, preloadDelay = 25) {
    super();

    this.alerts = new AlertHostViewModel();
    this.routeHandler = new RouteHandlerViewModel(routingMap);
    this.header = new PageHeaderViewModel(this.routeHandler);
    this.footer = new PageFooterViewModel();

    // this is a micro delay for the preloader to prevent FOUC
    this.isLoading = Observable
      .of(false)
      .delay(preloadDelay)
      .toProperty(true);

    Current = this;
  }
}

export let Current: AppViewModel = null;
