import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';
import { Default as pubSub } from '../../../Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;

  public alerts: wx.IObservableReadOnlyProperty<AlertViewModel[]>;

  private addAlert: wx.ICommand<AlertViewModel>;
  private removeAlert: wx.ICommand<AlertViewModel>;

  constructor() {
    super();

    const alerts = wx.property<AlertViewModel[]>([]);
    this.alerts = <wx.IObservableReadOnlyProperty<AlertViewModel[]>>alerts;

    this.addAlert = wx.asyncCommand((alert: AlertViewModel) => {
      this.alerts(this.alerts().concat([ alert ]));
      return Observable.of(alert);
    });

    this.removeAlert = wx.asyncCommand((alert: AlertViewModel) => {
      this.alerts(this.alerts().filter(x => x !== alert));
      return Observable.of(alert);
    });

    this.subscribe(
      this.addAlert.results
        .flatMap(alert => {
          return wx
            .whenAny(alert.isVisible, isVisible => ({ alert, isVisible }))
            .filter(x => x.isVisible === false)
            .map(x => x.alert);
        })
        .invokeCommand(this.removeAlert),
    );

    this.subscribe(
      pubSub.observe<AlertCreated>(AlertCreatedKey)
        .map(x => new AlertViewModel(++this.currentAlertKey, x.content, x.header, x.style, x.timeout))
        .invokeCommand(this.addAlert),
    );
  }
}
