import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';

import { Property } from './Interfaces';
import { isSubject, handleError } from './Utils';

export class ObservableProperty<T> extends Subscription implements Property<T> {
  protected changedSubject: BehaviorSubject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  constructor(
    initialValue?: T,
    protected source: Observable<T> = new Subject<T>(),
  ) {
    super();

    this.changedSubject = this.addSubscription(new BehaviorSubject<T>(initialValue!));
    this.thrownErrorsSubject = this.addSubscription(new Subject<Error>());

    this.add(
      this.source
        // seed the observable subscription with the initial value so that
        // distinctUntilChanged knows what the initial value is
        .startWith(initialValue!)
        .distinctUntilChanged()
        .subscribe(
          x => {
            if (this.isNewValue(x)) {
              this.changedSubject.next(x);
            }
          },
          e => {
            handleError(e, this.thrownErrorsSubject);
          },
        ),
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
      this.source.next(newValue);
    }
    else {
      throw new Error('attempt to write to a read-only observable property');
    }
  }

  get changed() {
    return this.changedSubject
      // BehaviorSubject fires immediately, so skip the first event
      .skip(1);
  }

  get thrownErrors() {
    return this.thrownErrorsSubject
      .asObservable();
  }

  isProperty() {
    return true;
  }
}

export function property<T>(
  initialValue?: T,
  source?: Observable<T>,
): Property<T> {
  return new ObservableProperty(initialValue, source);
}
