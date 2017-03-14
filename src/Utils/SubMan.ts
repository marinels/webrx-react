import { IDisposable } from  'rx';

export class SubMan implements IDisposable {
  public static displayName = 'SubMan';

  private subscriptions: IDisposable[];

  constructor(...subscriptions: IDisposable[]) {
    this.subscriptions = subscriptions;
  }

  public add(...subscriptions: IDisposable[]) {
    this.subscriptions.push(...subscriptions);
  }

  dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions.length = 0;
  }
}
