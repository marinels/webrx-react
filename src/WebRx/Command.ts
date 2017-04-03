import { Observable, Subject, BehaviorSubject, IObserver, IDisposable, Scheduler } from 'rx';

import { Command } from './Interfaces';
import { asObservable, isObserver, handleError } from './Utils';

export class ObservableCommand<T> implements Command<T>, IDisposable {
  private canExecuteSubscription: IDisposable;

  protected isExecutingSubject: BehaviorSubject<boolean>;
  protected canExecuteSubject: BehaviorSubject<boolean>;
  protected resultsSubject: Subject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  constructor(
    protected executeAction: (parameter: any) => Observable<T>,
    canExecute?: Observable<boolean>,
  ) {
    this.isExecutingSubject = new BehaviorSubject<boolean>(false);
    this.canExecuteSubject = new BehaviorSubject<boolean>(canExecute == null);
    this.resultsSubject = new Subject<T>();
    this.thrownErrorsSubject = new Subject<Error>();

    this.canExecuteSubscription = (canExecute || asObservable(true))
      .combineLatest(this.isExecutingSubject, (ce, ie) => ce === true && ie === false)
      .catch(e => {
        handleError(e, this.thrownErrorsSubject);

        return asObservable(false);
      })
      .distinctUntilChanged()
      .subscribe(this.canExecuteSubject);
  }

  get isExecutingObservable() {
    return this.isExecutingSubject
      .distinctUntilChanged();
  }

  get isExecuting() {
    // COMPAT -- we need to return the observable instead of the current value
    // return this.isExecutingSubject.getValue();

    return this.isExecutingObservable;
  }

  get canExecuteObservable() {
    return this.canExecuteSubject
      .distinctUntilChanged();
  }

  // COMPAT -- we need to define this as a function instead of a getter
  // get canExecute() {
  canExecute(parameter?: any) {
    return this.canExecuteSubject.getValue();
  }

  observeExecution(parameter?: any) {
    if (this.canExecute() === false) {
      return Observable.throw<T>(new Error('canExecute currently forbids execution'));
    }

    return Observable
      .of(parameter)
      .do(() => {
        this.isExecutingSubject.onNext(true);
      })
      .flatMap(x => {
        return this.executeAction(x);
      })
      .do(x => {
        this.resultsSubject.onNext(x);
      })
      .do(
        () => {
          this.isExecutingSubject.onNext(false);
        },
        () => {
          this.isExecutingSubject.onNext(false);
        },
        () => {
          this.isExecutingSubject.onNext(false);
        },
      )
      .catch(e => {
        handleError(e, this.thrownErrorsSubject);

        return Observable.empty<T>();
      })
      // this will prevent execution if nobody is subscribing to the result
      .share();
  }

  execute(
    parameter?: any,
    observerOrNext?: IObserver<T> | ((value: T) => void),
    onError: (exception: any) => void = e => handleError(e, this.thrownErrorsSubject),
    onCompleted?: () => void,
  ) {
    return this
      .observeExecution(parameter)
      .subscribeWith(observerOrNext, onError, onCompleted);
  }

  get results() {
    return this.resultsSubject
      .asObservable();
  }

  get thrownErrors() {
    return this.thrownErrorsSubject
      .asObservable();
  }

  dispose() {
    this.canExecuteSubscription = Object.dispose(this.canExecuteSubscription);
    this.isExecutingSubject = Object.dispose(this.isExecutingSubject);
    this.resultsSubject = Object.dispose(this.resultsSubject);
    this.thrownErrorsSubject = Object.dispose(this.thrownErrorsSubject);
  }
}

export function command<T>(
  execute: (parameter: any) => T | Observable<T> = (x: T) => x,
  canExecute?: Observable<boolean>,
): Command<T> {
  return new ObservableCommand((parameter: any) => asObservable(execute(parameter)), canExecute);
}
