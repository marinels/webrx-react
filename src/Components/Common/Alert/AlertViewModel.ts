import { Command, ReadOnlyProperty } from '../../../WebRx';
import { BaseViewModel } from '../../React';

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

  public readonly dismiss: Command;

  constructor(
    public readonly key: any,
    public readonly content: any,
    public readonly header?: string,
    public readonly style = DefaultStyle,
    private readonly timeout = DefaultTimeout,
  ) {
    super();

    this.dismiss = this.wx.command();

    this.isVisible = this.dismiss.results.map(() => false).toProperty(true);

    this.addSubscription(
      this.wx
        .getObservable(true)
        .delay(this.timeout)
        .invokeCommand(this.dismiss),
    );
  }
}
