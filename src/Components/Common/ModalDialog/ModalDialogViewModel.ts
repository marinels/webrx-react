import { Observable } from 'rxjs';

import { Command, ObservableLike, ReadOnlyProperty } from '../../../WebRx';
import { BaseViewModel } from '../../React';

export class ModalDialogViewModel<T> extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public readonly context: ReadOnlyProperty<T>;
  public readonly isVisible: ReadOnlyProperty<boolean>;

  public readonly show: Command<boolean>;
  public readonly hide: Command<boolean>;

  constructor(
    context: ObservableLike<T>,
  ) {
    super();

    this.show = this.wx.command(() => true);
    this.hide = this.wx.command(() => false);

    // any context observable result will generate a new context property changed event
    this.context = this.wx.getObservable(context)
      .toProperty(undefined, false);

    this.isVisible = Observable
      .merge(
        this.wx.whenAny(this.context, x => x != null),
        this.show.results,
        this.hide.results,
      )
      .toProperty(false);
  }

  public hideOnExecute<TResult>(command: Command<TResult>) {
    if (command != null) {
      this.addSubscription(
        Observable
          .merge(
            this.isVisible.changed,
            command.results.map(() => false),
            command.thrownErrors.map(() => false),
          )
          .distinctUntilChanged()
          .filter(x => x === false)
          .invokeCommand(this.hide),
      );
    }
    else {
      this.logger.warn('hideOnExecute called with null command');
    }

    return command;
  }
}
