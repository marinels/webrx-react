import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';

export enum DialogResult {
  Accepted,
  Cancelled
}

export interface IValidatable {
  isValid: wx.IObservableProperty<boolean>;
}

export class ModalDialogViewModel<T> extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  public title = wx.property('');
  public cancelText = wx.property('Cancel');
  public acceptText = wx.property('Accept');

  public accept = wx.asyncCommand(this.getCanAccept(), x => Rx.Observable.return(DialogResult.Accepted));
  public cancel = wx.asyncCommand(x => Rx.Observable.return(DialogResult.Cancelled));
  public reset = wx.asyncCommand(x => Rx.Observable.return(null));
  public show = wx.asyncCommand(x => Rx.Observable.return(true));
  public hide = wx.asyncCommand(x => Rx.Observable.return(false));

  public isVisible: wx.IObservableProperty<boolean> = null;

  public result = Rx.Observable
    .merge<DialogResult>(this.accept.results, this.cancel.results, this.reset.results)
    .toProperty();

  constructor(title?: string, public content?: T, isVisible = false) {
    super();

    this.content = content;

    if (String.isNullOrEmpty(title) === false) {
      this.title(title);
    }

    this.isVisible = Rx.Observable
      .merge(
        this.accept.results.select(x => false),
        this.cancel.results.select(x => false),
        this.reset.results.select(x => false),
        this.show.results,
        this.hide.results
      )
      .startWith(isVisible)
      .toProperty();
  }

  private getCanAccept() {
    let validatable = <any>this.content as IValidatable;

    return (validatable == null || validatable.isValid == null) ?
      Rx.Observable.return(true) :
      validatable.isValid.changed.startWith(validatable.isValid());
  }
};
