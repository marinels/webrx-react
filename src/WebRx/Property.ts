import { Observable, Subject, BehaviorSubject, IDisposable, Scheduler } from 'rx';

import { PropertyClass, Property } from './Interfaces';
import { asObservable, isSubject, handleError } from './Utils';

export class ObservableProperty<T> implements PropertyClass<T>, IDisposable {
  private sourceSubscription: IDisposable;

  protected changedSubject: BehaviorSubject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  // public readonly changed: Observable<T>;
  // public readonly thrownErrors: Observable<Error>;

  constructor(
    initialValue?: T,
    protected source: Observable<T> = new Subject<T>(),
  ) {
    this.changedSubject = new BehaviorSubject<T>(initialValue!);
    this.thrownErrorsSubject = new Subject<Error>();

    // this.changed = this.changedSubject
    //   // skip the initial value so we only generate events for new values
    //   .skip(1)
    //   .share();

    // this.thrownErrors = this.thrownErrorsSubject
    //   .share();

    this.sourceSubscription = this.source
      .distinctUntilChanged()
      .subscribe(
        x => {
          if (this.isNewValue(x)) {
            this.changedSubject.onNext(x);
          }
        },
        e => {
          handleError(e, this.thrownErrorsSubject);
        },
      );
  }

  protected isNewValue(newValue: T) {
    return newValue !== this.value;
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
    else {
      throw new Error('attempt to write to a read-only observable property');
    }
  }

  get changed() {
    return this.changedSubject
      .skip(1);
  }

  get thrownErrors() {
    return this.thrownErrorsSubject
      .asObservable();
  }

  dispose() {
    this.sourceSubscription = Object.dispose(this.sourceSubscription);
    this.changedSubject = Object.dispose(this.changedSubject);
    this.thrownErrorsSubject = Object.dispose(this.thrownErrorsSubject);
  }
}

export function property<T>(
  initialValue?: T,
  source?: Observable<T>,
) {
  return new ObservableProperty(initialValue, source);
}
