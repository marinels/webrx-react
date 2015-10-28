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

export const DefaultStyle = 'info';
export const DefaultTimeout = 5000;

export class AlertViewModel extends BaseViewModel {
  constructor(private owner: wx.IObservableList<AlertViewModel>, public key: any, public text: string, public header?: string, public style = DefaultStyle, private timeout = DefaultTimeout) {
    super();
  }

  public show = wx.asyncCommand(x => Rx.Observable.return(true));
  public dismiss = wx.asyncCommand(x => Rx.Observable.return(false));

  public isVisible = Rx.Observable
    .merge(
      this.show.results,
      this.dismiss.results.take(1)
    )
    .toProperty();

  initialize() {
    super.initialize();

    this.subscribe(Rx.Observable
      .return(false)
      .delay(this.timeout)
      .invokeCommand(this.dismiss));

    this.subscribe(this.dismiss.results
      .take(1)
      .delay(100)
      .subscribe(x => {
        this.owner.remove(this);
      }));
  }
}

export default AlertViewModel;
