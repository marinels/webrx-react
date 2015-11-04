'use strict';

export interface ISubscriptionAction<T> {
  (arg: T): void;
}

interface ISubscriptionCallback<T> {
  action: ISubscriptionAction<T>;
  thisArg?: any;
}

export interface ISubscriptionHandle {
  id: number;
  key: string;
}

interface ISubscription<T> {
  callback: ISubscriptionCallback<T>;
  handle: ISubscriptionHandle;
}

class SubscriptionList<T> {
  private currentHandle = 0;
  private list: ISubscription<T>[] = [];

  public add(key: string, callback: ISubscriptionCallback<T>) {
    let handle = <ISubscriptionHandle>{ id: ++this.currentHandle, key };

    this.list.push(<ISubscription<T>>{ callback, handle })

    return handle;
  }

  public remove(handle: ISubscriptionHandle) {
    let index = -1;
    this.list.some((x, i) => x.handle.id === handle.id ? ((index = i), true) : false );
    if (index >= 0) {
      this.list.splice(index, 1);
    }
  }

  public invoke<T>(arg: T) {
    if (this.list.length > 0) {
      this.list.forEach(x => x.callback.action.apply(x.callback.thisArg, [arg]))
    }
  }
}

interface IPubSubMap {
  [key: string]: SubscriptionList<any>;
}

export class PubSub {
  private map = <IPubSubMap>{};

  private getList<T>(key: string, action: (list: SubscriptionList<T>) => void, createMissing = false) {
    let list = this.map[key];

    if (list == null && createMissing) {
      list = new SubscriptionList<T>();
      this.map[key] = list;
    }

    if (list != null) {
      action(list);
    }
  }

  public subscribe<T>(key: string, action: ISubscriptionAction<T>, thisArg?: any) {
    let handle: ISubscriptionHandle;

    this.getList<T>(key, x => { handle = x.add(key, <ISubscriptionCallback<T>>{action, thisArg}) }, true);

    return handle;
  }

  public unsubscribe(handle: ISubscriptionHandle): ISubscriptionHandle {
    this.getList<any>(handle.key, x => x.remove(handle));

    return null;
  }

  public publish<T>(key: string, arg: T) {
    this.getList<T>(key, x => x.invoke(arg));
  }
}

export let Default = new PubSub();

export default Default;
