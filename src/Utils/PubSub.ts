import { Subject, IDisposable } from 'rx';
import * as wx from 'webrx';

import { Logger, getLogger } from './Logging';

interface PubSubMap {
  [key: string]: Subject<any>;
}

export class PubSub implements IDisposable {
  public static displayName = 'PubSub';

  private logger: wx.Lazy<Logger>;
  private map: PubSubMap | undefined;

  constructor() {
    this.logger = new wx.Lazy(() => getLogger(PubSub.displayName));
    this.map = {};
  }

  private getSubject<T>(key: string) {
    let subject: Subject<T> = this.map![key];

    if (subject == null) {
      subject = new Subject<T>();
      this.map![key] = subject;
    }

    return subject;
  }

  public observe<T>(key: string) {
    return this.getSubject<T>(key)
      .asObservable();
  }

  public subscribe<T>(key: string, onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void) {
    if (onError == null) {
      onError = e => {
        this.logger.value.error('PubSub Error', e);
      };
    }

    return this.observe<T>(key)
      .subscribe(onNext, onError, onCompleted);
  }

  public publish<T>(key: string, arg?: T) {
    this.getSubject<T>(key).onNext(arg!);
  }

  dispose() {
    if (this.map != null) {
      Object.getOwnPropertyNames(this.map)
        .map(x => this.map![x])
        .forEach(x => x.dispose());

      this.map = undefined;
    }
  }
}

export const Default = new PubSub();

export function observe<T>(key: string) {
  return Default.observe<T>(key);
}

export function subscribe<T>(key: string, onNext?: (value: T) => void, onError?: (exception: any) => void, onCompleted?: () => void) {
  return Default.subscribe(key, onNext, onerror, onCompleted);
}

export function publish<T>(key: string, arg?: T) {
  Default.publish(key, arg);
}
