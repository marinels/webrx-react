import { Observable } from  'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';

export interface Alert {
  key: string;
  content: any;
  header?: string;
  style?: string;
  timeout?: number;
}

export const DefaultStyle = 'info';
export const DefaultTimeout = 5000;

export class AlertViewModel extends BaseViewModel {
  public static displayName = 'AlertViewModel';

  public isVisible: wx.IObservableReadOnlyProperty<boolean>;

  public dismiss: wx.ICommand<any>;

  constructor(public key: any, public content: any, public header?: string, public style = DefaultStyle, private timeout = DefaultTimeout) {
    super();

    this.dismiss = wx.command();

    this.isVisible = this.dismiss.results
      .map(x => false)
      .toProperty(true);

    Observable
      .of(null)
      .delay(this.timeout)
      .invokeCommand(this.dismiss);
  }
}
