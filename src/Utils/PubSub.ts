'use strict';

export interface ISubscriptionAction {
  (args: any[]): void;
}

interface ISubscriptionCallback {
  action: ISubscriptionAction;
  thisArg?: any;
}

export interface ISubscriptionHandle {
  id: number;
  key: string;
}

interface ISubscription {
  callback: ISubscriptionCallback;
  handle: ISubscriptionHandle;
}

class SubscriptionList {
  private currentHandle = 0;
  private list: ISubscription[] = [];

  public add(key: string, callback: ISubscriptionCallback) {
    let handle = <ISubscriptionHandle>{ id: ++this.currentHandle, key };

    this.list.push(<ISubscription>{ callback, handle })

    return handle;
  }

  public remove(handle: ISubscriptionHandle) {
    let index = -1;
    this.list.some((x, i) => x.handle.id === handle.id ? ((index = i), true) : false );
    if (index >= 0) {
      this.list.splice(index, 1);
    }
  }

  public invoke(args: any[]) {
    if (this.list.length > 0) {
      this.list.forEach(x => x.callback.action.apply(x.callback.thisArg, [args]))
    }
  }
}

interface IPubSubMap {
  [key: string]: SubscriptionList;
}

export class PubSub {
  private map = <IPubSubMap>{};

  private getList(key: string, action: (list: SubscriptionList) => void, createMissing = false) {
    let list = this.map[key];

    if (list == null && createMissing) {
      list = new SubscriptionList();
      this.map[key] = list;
    }

    if (list != null) {
      action(list);
    }
  }

  public subscribe(key: string, action: ISubscriptionAction, thisArg?: any) {
    let handle: ISubscriptionHandle;

    this.getList(key, x => { handle = x.add(key, <ISubscriptionCallback>{action, thisArg}) }, true);

    return handle;
  }

  public unsubscribe(handle: ISubscriptionHandle): ISubscriptionHandle {
    this.getList(handle.key, x => x.remove(handle));

    return null;
  }

  public publish(key: string, ...args: any[]) {
    this.getList(key, x => x.invoke(args));
  }
}

export let Default = new PubSub();

export default Default;
