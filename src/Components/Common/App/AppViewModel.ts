import { Observable } from 'rxjs';

import { RouteMap, RouteMapper } from '../../../Routing';
import { ObservableLike, ReadOnlyProperty } from '../../../WebRx';
import { BaseViewModel } from '../../React';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import {
  RouteHandlerViewModel,
  SplashKey,
} from '../RouteHandler/RouteHandlerViewModel';

// inject a default route
RouteMap['/'] = { path: SplashKey };
// setup default splash route
RouteMap[`^/${SplashKey}$`] = { creator: () => SplashKey };

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public readonly alerts: AlertHostViewModel;
  public readonly routeHandler: RouteHandlerViewModel;
  public readonly header: PageHeaderViewModel;
  public readonly footer: PageFooterViewModel;

  public readonly isLoading: ReadOnlyProperty<boolean>;

  constructor(
    alerts: boolean | AlertHostViewModel = false,
    header: boolean | PageHeaderViewModel = false,
    footer: boolean | PageFooterViewModel = false,
    isLoading?: ObservableLike<boolean>,
    routingMap = RouteMap,
  ) {
    super();

    if (alerts) {
      this.alerts = alerts === true ? new AlertHostViewModel() : alerts;
    }

    this.routeHandler = new RouteHandlerViewModel(routingMap);

    if (header) {
      this.header =
        header === true ? new PageHeaderViewModel(this.routeHandler) : header;
    }

    if (footer) {
      this.footer = footer === true ? new PageFooterViewModel() : footer;
    }

    this.isLoading = this.wx.getProperty(
      isLoading ||
        Observable.of(false)
          // this is a micro delay for the preloader to prevent FOUC
          .delay(100),
    );

    Current = this;
  }
}

export let Current: AppViewModel;
