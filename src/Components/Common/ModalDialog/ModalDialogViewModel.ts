import { Observable } from 'rx';

import { Property, Command } from '../../../WebRx';

import { BaseViewModel } from '../../React/BaseViewModel';

export class ModalDialogViewModel extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public readonly isVisible: Property<boolean>;

  public readonly show: Command<any>;
  public readonly hide: Command<any>;

  constructor(isVisible = false) {
    super();

    this.show = this.command();
    this.hide = this.command();

    this.isVisible = Observable
      .merge(
        this.show.results.map(() => true),
        this.hide.results.map(() => false),
      )
      .toProperty(isVisible);
  }

  public hideOnExecute<T>(command: Command<T>) {
    if (command != null) {
      this.addSubscription(
        Observable
          .merge(
            command.results.map(() => null),
            command.thrownErrors.map(() => null),
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
