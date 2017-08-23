import { Observable } from 'rxjs';

import { ReadOnlyProperty, ObservableLike } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { RouteHandlerViewModel, SplashKey } from '../RouteHandler/RouteHandlerViewModel';
import { RouteMap, RouteMapper } from '../../../Routing/RoutingMap';

// inject a default route
RouteMap['/'] = { path: SplashKey };
// setup default splash route
RouteMap[`^/${ SplashKey }$`] = { creator: () => SplashKey };

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public readonly alerts: AlertHostViewModel;
  public readonly routeHandler: RouteHandlerViewModel;
  public readonly header: PageHeaderViewModel;
  public readonly footer: PageFooterViewModel;

  public readonly isLoading: ReadOnlyProperty<boolean>;

  constructor(alerts = false, header = false, footer = false, isLoading?: ObservableLike<boolean>, routingMap = RouteMap) {
    super();

    if (alerts === true) {
      this.alerts = new AlertHostViewModel();
    }

    this.routeHandler = new RouteHandlerViewModel(routingMap);

    if (header === true) {
      this.header = new PageHeaderViewModel(this.routeHandler);
    }

    if (footer === true) {
      this.footer = new PageFooterViewModel();
    }

    this.isLoading = this
      .getProperty(
        isLoading ||
        Observable
          .of(false)
          // this is a micro delay for the preloader to prevent FOUC
          .delay(100),
      );

    Current = this;
  }
}

export let Current: AppViewModel;
