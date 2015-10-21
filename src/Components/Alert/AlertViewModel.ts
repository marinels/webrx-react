'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export interface IAlert {
  key: string;
  text: string;
  header?: string;
  style?: string;
  timeout?: number;
}

export class AlertViewModel extends BaseViewModel {
  constructor(private owner: wx.IObservableList<AlertViewModel>, public key: any, public text: string, public header?: string, public style = 'info', private timeout = 5000) {
    super();
  }

  public dismiss = wx.asyncCommand(x => Rx.Observable.return(false));
  public isVisible = Rx.Observable
    .merge(
      this.dismiss.results,
      Rx.Observable.return(false).delay(this.timeout))
    .startWith(true)
    .do(x => {
      if (x === false) {
        this.owner.remove(this);
      }
    })
    .toProperty();
}

export default AlertViewModel;
