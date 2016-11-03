import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { RouteHandlerViewModel } from '../RouteHandler/RouteHandlerViewModel';
import { DefaultRouteManager } from '../../../Routing/RouteManager';
import { RouteMap } from '../../../Routing/RoutingMap';

// inject a default route
RouteMap['/'] = { path: 'Splash' };

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public alerts = new AlertHostViewModel();
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer = new PageFooterViewModel();

  constructor(routingMap = RouteMap, routeManager = DefaultRouteManager) {
    super();

    this.routeHandler = new RouteHandlerViewModel(routeManager, routingMap);

    this.header = new PageHeaderViewModel(this.routeHandler);

    Current = this;
  }
}

export let Current: AppViewModel = null;
