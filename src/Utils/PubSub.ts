import { Observable, Subject, Subscription } from 'rxjs';

import { getLogger, Logger } from './Logging';

export class PubSub extends Subscription {
  public static displayName = 'PubSub';

  private readonly logger: Logger;
  private map: StringMap<Subject<any>>;

  constructor() {
    super();

    this.logger = getLogger(PubSub.displayName);
    this.map = {};
  }

  private getSubject<T>(key: string) {
    let subject: Subject<T> = this.map[key];

    if (subject == null) {
      subject = new Subject<T>();
      this.map[key] = subject;
      this.add(subject);
    }

    return subject;
  }

  public observe<T>(key: string) {
    return this.getSubject<T>(key)
      .asObservable();
  }

  public subscribe<T>(
    key: string,
    onNext?: (value: T) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ) {
    if (onError == null) {
      onError = e => {
        this.logger.error('PubSub Error', e);
      };
    }

    return this.observe<T>(key)
      .subscribe(onNext, onError, onCompleted);
  }

  public publish<T>(key: string, arg: T) {
    this.getSubject<T>(key).next(arg);
  }
}

export const Default = new PubSub();

export function observe<T>(key: string) {
  return Default.observe<T>(key);
}

export function subscribe<T>(
  key: string,
  onNext?: (value: T) => void,
  onError?: (exception: any) => void,
  onCompleted?: () => void,
) {
  return Default.subscribe(key, onNext, onError, onCompleted);
}

export function publish<T>(key: string, arg?: T) {
  Default.publish(key, arg);
}
