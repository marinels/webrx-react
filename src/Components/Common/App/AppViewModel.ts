import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { RouteHandlerViewModel, RoutingMap } from '../RouteHandler/RouteHandlerViewModel';
import { Default as routeManager } from '../../../Routing/RouteManager';

export interface AppConfig {
  routingMap: RoutingMap;
}

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public alerts = new AlertHostViewModel();
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer = new PageFooterViewModel();

  constructor(public config = <AppConfig>{}) {
    super();

    this.config = config;

    this.routeHandler = new RouteHandlerViewModel(routeManager, config.routingMap);

    this.header = new PageHeaderViewModel(this.routeHandler);

    Current = this;
  }
}

export let Current: AppViewModel = null;
