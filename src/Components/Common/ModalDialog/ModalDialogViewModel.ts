import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';

export class ModalDialogViewModel extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public isVisible: wx.IObservableProperty<boolean> = null;

  public show: wx.ICommand<any>;
  public hide: wx.ICommand<any>;

  constructor(isVisible = false) {
    super();

    this.show = wx.command();
    this.hide = wx.command();

    this.isVisible = Rx.Observable
      .merge(this.show.results.map(x => true), this.hide.results.map(x => false))
      .startWith(isVisible)
      .toProperty();
  }

  public hideOnExecute<T>(command: wx.ICommand<T>) {
    this.subscribe(
      command.results.invokeCommand(this.hide)
    );

    return command;
  }
};
