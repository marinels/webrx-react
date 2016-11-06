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

  public alerts = new AlertHostViewModel();
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer = new PageFooterViewModel();

  constructor(routingMap = RouteMap) {
    super();

    this.routeHandler = new RouteHandlerViewModel(routingMap);

    this.header = new PageHeaderViewModel(this.routeHandler);

    Current = this;
  }
}

export let Current: AppViewModel = null;
