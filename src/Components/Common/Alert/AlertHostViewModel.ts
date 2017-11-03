import { Observable } from 'rxjs';

import { ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';
import { AlertViewModel } from '../Alert/AlertViewModel';
import { Default as pubSub } from '../../../Utils/PubSub';
import { AlertCreatedKey, AlertCreated } from '../../../Events/AlertCreated';

interface AlertEvent {
  add?: AlertViewModel;
  remove?: AlertViewModel;
}

export class AlertHostViewModel extends BaseViewModel {
  public static displayName = 'AlertHostViewModel';

  public readonly alerts: ReadOnlyProperty<AlertViewModel[]>;

  constructor() {
    super();

    const addAlert = this.wx.command<AlertViewModel>();
    const removeAlert = this.wx.command<AlertViewModel>();

    const events = Observable
      .merge(
        addAlert.results.map(add => <AlertEvent>{ add }),
        removeAlert.results.map(remove => <AlertEvent>{ remove }),
      );

    this.alerts = events
      .scan(
        (alerts: AlertViewModel[], event) => {
          if (event.add != null) {
            return (alerts || []).concat(event.add);
          }
          else if (event.remove != null) {
            return (alerts || []).filter(x => x !== event.remove);
          }

          throw new Error('Invalid Alert Event');
        },
        undefined,
      )
      .toProperty([], false);

    this.addSubscription(
      addAlert.results
        .flatMap(alert => {
          return this.wx
            .whenAny(alert.isVisible, isVisible => ({ alert, isVisible }))
            .filter(x => x.isVisible === false)
            .map(x => x.alert);
        })
        .do(x => {
          x.unsubscribe();
        })
        .invokeCommand(removeAlert),
    );

    this.addSubscription(
      pubSub.observe<AlertCreated>(AlertCreatedKey)
        .map((x, i) => new AlertViewModel(i, x.content, x.header, x.style, x.timeout))
        .invokeCommand(addAlert),
    );
  }
}
