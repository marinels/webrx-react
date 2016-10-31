import { Subject, IDisposable } from 'rx';

interface PubSubMap {
  [key: string]: Subject<any>;
}

export class PubSub implements IDisposable {
  public static displayName = 'PubSub';

  private map: PubSubMap;

  private getSubject<T>(key: string) {
    if (this.map == null) {
      this.map = {};
    }

    let subject: Subject<T> = this.map[key];

    if (subject == null) {
      subject = new Subject<T>();
      this.map[key] = subject;
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
        // tslint:disable-next-line:no-console
        console.error('PubSub Error', e);
      };
    }

    return this.observe<T>(key)
      .subscribe(onNext, onError, onCompleted);
  }

  public publish<T>(key: string, arg?: T) {
    this.getSubject<T>(key).onNext(arg);
  }

  dispose() {
    if (this.map != null) {
      Object.getOwnPropertyNames(this.map)
        .map(x => this.map[x])
        .forEach(x => x.dispose());

      this.map = null;
    }
  }
}

export const Default = new PubSub();
