import { Observable, Subject, BehaviorSubject, IDisposable } from 'rx';

import { PropertyClass, Property } from './Interfaces';
import { asObservable, isSubject } from './Utils';

export class ObservableProperty<T> implements PropertyClass<T>, IDisposable {
  protected changedSubject: BehaviorSubject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  public readonly changed: Observable<T>;
  public readonly thrownErrors: Observable<Error>;

  constructor(
    initialValue?: T,
    protected source: Observable<T> = new Subject<T>(),
  ) {
    this.changedSubject = new BehaviorSubject<T>(<any>initialValue);
    this.thrownErrorsSubject = new Subject<Error>();

    this.changed = this.source
      .catch(e => {
        const err = e instanceof Error ? e : new Error(e);
        this.thrownErrorsSubject.onNext(err);

        return Observable.empty<T>();
      })
      .distinctUntilChanged()
      .do(x => {
        this.changedSubject.onNext(x);
      })
      .share();

    this.thrownErrors = this.thrownErrorsSubject
      .share();
  }

  get isReadOnly() {
    return isSubject(this.source) === false;
  }

  get value() {
    return this.changedSubject.getValue();
  }

  set value(newValue: T) {
    if (isSubject(this.source)) {
      this.source.onNext(newValue);
    }

    throw new Error('attempt to write to a read-only observable property');
  }

  dispose() {
    this.changedSubject = Object.dispose(this.changedSubject);
    this.thrownErrorsSubject = Object.dispose(this.thrownErrorsSubject);
  }
}

// export function property<T>(
//   initialValue?: T,
//   source?: Observable<T>,
// ): Property<T> {
//   return new ObservableProperty(initialValue, source);
// }

// COMPAT

export function property<T>(
  initialValue?: T,
  source?: Observable<T>,
): Property<T> {
  const prop = new ObservableProperty(initialValue, source);

  return Object.assign<Property<T>>(function(this: Property<T>, value: T) {
    if (arguments.length === 0) {
      return this.value;
    }

    this.value = value;

    return undefined;
  }, prop);
}
