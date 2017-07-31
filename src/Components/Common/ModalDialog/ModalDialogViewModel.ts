import { Observable } from 'rxjs';

import { ObservableOrProperty, ReadOnlyProperty, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';

export class ModalDialogViewModel<T> extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public readonly context: ReadOnlyProperty<T>;
  public readonly isVisible: ReadOnlyProperty<boolean>;

  public readonly show: Command<boolean>;
  public readonly hide: Command<boolean>;

  constructor(
    context: ObservableOrProperty<T>,
  ) {
    super();

    this.show = this.command(() => true);
    this.hide = this.command(() => false);

    this.context = this.getProperty(context, undefined, false);

    this.isVisible = Observable
      .merge(
        this.whenAny(this.context, x => x != null),
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
            command.results.map(() => undefined),
            command.thrownErrors.map(() => undefined),
          )
          .take(1)
          .invokeCommand(this.hide),
      );
    }
    else {
      this.logger.warn('hideOnExecute called with null command');
    }

    return command;
  }
}
