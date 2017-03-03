import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { RouteHandlerViewModel, SplashKey } from '../RouteHandler/RouteHandlerViewModel';
import { RouteMap } from '../../../Routing/RoutingMap';

// inject a default route
RouteMap['/'] = { path: SplashKey };
// setup default splash route
RouteMap[`^/${ SplashKey }$`] = { creator: () => SplashKey };

export class AppViewModel extends BaseViewModel {
  public static displayName = 'AppViewModel';

  public alerts: AlertHostViewModel;
  public routeHandler: RouteHandlerViewModel;
  public header: PageHeaderViewModel;
  public footer: PageFooterViewModel;

  public isLoading: wx.IObservableReadOnlyProperty<boolean>;

  constructor(alerts = false, header = false, footer = false, isLoading?: wx.ObservableOrProperty<boolean>, routingMap = RouteMap) {
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

    if (wx.isProperty(isLoading) === true) {
      this.isLoading = <wx.IObservableReadOnlyProperty<boolean>>isLoading;
    }
    else if (Observable.isObservable(isLoading) === true) {
      this.isLoading = (<Observable<boolean>>isLoading).toProperty(true);
    }
    else {
      this.isLoading = Observable
        .of(false)
        // this is a micro delay for the preloader to prevent FOUC
        .delay(100)
        .toProperty(true);
    }

    Current = this;
  }
}

export let Current: AppViewModel = null;
