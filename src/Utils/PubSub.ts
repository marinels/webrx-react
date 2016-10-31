export interface SubscriptionAction<T> {
  (arg: T): void;
}

export interface SubscriptionCallback<T> {
  action: SubscriptionAction<T>;
  thisArg?: any;
}

export interface SubscriptionHandle {
  id: number;
  key: string;
}

export interface Subscription<T> {
  callback: SubscriptionCallback<T>;
  handle: SubscriptionHandle;
}

class SubscriptionList<T> {
  public static displayName = 'SubscriptionList';
  private currentHandle = 0;
  private list: Subscription<T>[] = [];

  public add(key: string, callback: SubscriptionCallback<T>) {
    let handle = <SubscriptionHandle>{ id: ++this.currentHandle, key };

    this.list.push(<Subscription<T>>{ callback, handle });

    return handle;
  }

  public remove(handle: SubscriptionHandle) {
    let index = -1;
    this.list.some((x, i) => x.handle.id === handle.id ? ((index = i), true) : false );
    if (index >= 0) {
      this.list.splice(index, 1);
    }
  }

  public invoke<T>(arg: T) {
    if (this.list.length > 0) {
      this.list.forEach(x => x.callback.action.apply(x.callback.thisArg, [arg]));
    }
  }
}

interface PubSubMap {
  [key: string]: SubscriptionList<any>;
}

export class PubSub {
  public static displayName = 'PubSub';
  private map = <PubSubMap>{};

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

  public subscribe<T>(key: string, action: SubscriptionAction<T>, thisArg?: any) {
    let handle: SubscriptionHandle;

    this.getList<T>(key, x => { handle = x.add(key, <SubscriptionCallback<T>>{action, thisArg}); }, true);

    return handle;
  }

  public unsubscribe(handle: SubscriptionHandle): SubscriptionHandle {
    this.getList<any>(handle.key, x => x.remove(handle));

    return null;
  }

  public publish<T>(key: string, arg?: T) {
    this.getList<T>(key, x => x.invoke(arg));
  }
}

export const Default = new PubSub();
