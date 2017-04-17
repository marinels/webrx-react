import { Observable } from 'rx';

import { wx } from '../../../WebRx';

import { BaseViewModel } from '../../React/BaseViewModel';

export class ModalDialogViewModel extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public isVisible: wx.IObservableProperty<boolean>;

  public show: wx.ICommand<any>;
  public hide: wx.ICommand<any>;

  constructor(isVisible = false) {
    super();

    this.show = wx.command();
    this.hide = wx.command();

    this.isVisible = Observable
      .merge(this.show.results.map(x => true), this.hide.results.map(x => false))
      .startWith(isVisible)
      .toProperty();
  }

  public hideOnExecute<T>(command: wx.ICommand<T>) {
    if (command != null) {
      this.subscribe(
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
};
