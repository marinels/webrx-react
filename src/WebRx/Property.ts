import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

import { Property } from './Interfaces';
import { handleError, isObservable, isSubject } from './Utils';

export class ObservableProperty<T> extends Subscription implements Property<T> {
  protected changedSubject: BehaviorSubject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  constructor(
    initialValue?: T,
    compare?: (x: T, y: T) => boolean,
    keySelector?: (x: T) => any,
    protected source: Observable<T> = new Subject<T>(),
  ) {
    super();

    this.changedSubject = this.addSubscription(
      new BehaviorSubject<T>(initialValue!),
    );
    this.thrownErrorsSubject = this.addSubscription(new Subject<Error>());

    this.add(
      this.source
        // seed the observable subscription with the initial value so that
        // distinctUntilChanged knows what the initial value is
        .startWith(initialValue!)
        .distinctUntilChanged(compare!, keySelector!)
        .subscribe(
          x => {
            this.changedSubject.next(x);
          },
          e => {
            handleError(e, this.thrownErrorsSubject);
          },
        ),
    );
  }

  get isReadOnly() {
    return isSubject(this.source) === false;
  }

  get value() {
    return this.changedSubject.getValue();
  }

  set value(newValue: T) {
    if (isSubject(this.source)) {
      this.source.next(newValue);
    } else {
      throw new Error('attempt to write to a read-only observable property');
    }
  }

  get changed() {
    return (
      this.changedSubject
        // BehaviorSubject fires immediately, so skip the first event
        .skip(1)
    );
  }

  get thrownErrors() {
    return this.thrownErrorsSubject.asObservable();
  }

  isProperty() {
    return true;
  }
}

export function property<T>(
  initialValue?: T,
  source?: Observable<T>,
): Property<T>;

export function property<T>(
  initialValue?: T,
  compare?: boolean | ((x: T, y: T) => boolean),
  source?: Observable<T>,
): Property<T>;

export function property<T>(
  initialValue?: T,
  compare?: boolean | ((x: T, y: T) => boolean),
  keySelector?: (x: T) => any,
  source?: Observable<T>,
): Property<T>;

export function property<T>(...args: any[]): Property<T> {
  const initialValue: T = args.shift();

  let compare: undefined | ((x: T, y: T) => boolean);
  let keySelector: undefined | ((x: T) => any);
  let source: undefined | Observable<T>;

  let arg = args.shift();

  if (isObservable<T>(arg)) {
    source = arg;
  } else {
    // if arg is true, then we use the default comparator function

    if (arg === false) {
      // this results in every value being interpreted as a new value
      compare = () => false;
    } else if (arg instanceof Function) {
      compare = arg;
    }
  }

  arg = args.shift();

  if (isObservable<T>(arg)) {
    source = arg;
  } else {
    keySelector = arg;
  }

  arg = args.shift();

  if (isObservable<T>(arg)) {
    source = arg;
  }

  return new ObservableProperty(initialValue, compare, keySelector, source);
}
