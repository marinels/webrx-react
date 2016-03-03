'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';

export enum DialogResult {
  Accepted,
  Cancelled
}

export interface IValidatable {
  isValid: Rx.Observable<boolean>;
}

export class ModalDialogViewModel extends BaseViewModel {
  public static displayName = 'ModalDialogViewModel';

  constructor(title?: string, public content?: IValidatable | any) {
    super();

    if (String.isNullOrEmpty(title) === false) {
      this.title(title);
    }
  }

  public title = wx.property('');
  public cancelText = wx.property('Cancel');
  public acceptText = wx.property('Accept');

  public accept = wx.asyncCommand(this.getCanAccept(), x => Rx.Observable.return(DialogResult.Accepted));
  public cancel = wx.asyncCommand(x => Rx.Observable.return(DialogResult.Cancelled));
  public reset = wx.asyncCommand(x => Rx.Observable.return(null));

  public result = Rx.Observable
    .merge(this.accept.results, this.cancel.results, this.reset.results)
    .toProperty();

  private getCanAccept() {
    let validatable = this.content as IValidatable;

    return validatable.isValid == null ? Rx.Observable.return(true) : validatable.isValid;
  }
};

export default ModalDialogViewModel;
