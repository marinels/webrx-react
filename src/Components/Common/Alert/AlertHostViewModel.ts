import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';
import { Default as pubSub } from '../../../Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../../Events/AlertCreated';

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  private currentAlertKey = 0;

  public alerts: wx.IObservableList<AlertViewModel>;

  private newAlert: wx.ICommand<AlertCreated>;

  constructor() {
    super();

    this.alerts = wx.list<AlertViewModel>();

    this.newAlert = wx.asyncCommand((x: AlertCreated) => Observable.of(x));

    this.subscribe(
      pubSub.observe<AlertCreated>(AlertCreatedKey)
        .invokeCommand(this.newAlert)
    );

    this.subscribe(
      this.newAlert.results
        .map(x => new AlertViewModel(++this.currentAlertKey, x.content, x.header, x.style, x.timeout))
        .subscribe(alert => {
          wx
            .whenAny(alert.isVisible, x => x)
            .filter(x => x === false)
            .take(1)
            .subscribe(x => {
              this.alerts.remove(alert);
            });

          this.alerts.add(alert);
        })
    );
  }
}
