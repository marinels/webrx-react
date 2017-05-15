import { IDisposable } from  'rx';

export class SubMan implements IDisposable {
  public static displayName = 'SubMan';

  private readonly subscriptions: IDisposable[];

  constructor(...subscriptions: IDisposable[]) {
    this.subscriptions = subscriptions;
  }

  public add(subscription: IDisposable) {
    this.subscriptions.push(subscription);

    return subscription;
  }

  public addMany(...subscriptions: IDisposable[]) {
    this.subscriptions.push(...subscriptions);

    return subscriptions;
  }

  dispose() {
    this.subscriptions.forEach(x => x.dispose());
    this.subscriptions.length = 0;
  }
}
