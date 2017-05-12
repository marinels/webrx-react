import { Observable } from  'rx';

import { ReadOnlyProperty, Command } from '../../../WebRx';
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

  public readonly isVisible: ReadOnlyProperty<boolean>;

  public readonly dismiss: Command<any>;

  constructor(public key: any, public content: any, public header?: string, public style = DefaultStyle, private timeout = DefaultTimeout) {
    super();

    this.dismiss = this.command();

    this.isVisible = this.dismiss.results
      .map(x => false)
      .toProperty(true);

    this
      .getObservable(true)
      .delay(this.timeout)
      .invokeCommand(this.dismiss);
  }
}
