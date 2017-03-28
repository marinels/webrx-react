import { Observable, Subject, IObserver, IDisposable } from 'rx';

import { Command } from './Interfaces';
import { asObservable, isObserver } from './Utils';

export class ObservableCommand<T> implements Command<T>, IDisposable {
  protected isExecutingSubject: Subject<boolean>;
  protected resultsSubject: Subject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  public readonly isExecutingObservable: Observable<boolean>;
  public readonly canExecuteObservable: Observable<boolean>;
  public readonly results: Observable<T>;
  public readonly thrownErrors: Observable<Error>;

  constructor(
    protected executeAction: (parameter: any) => Observable<T>,
    canExecute: Observable<boolean> = asObservable(true),
  ) {
    this.isExecutingSubject = new Subject<boolean>();
    this.resultsSubject = new Subject<T>();
    this.thrownErrorsSubject = new Subject<Error>();

    this.isExecutingObservable = this.isExecutingSubject
      .distinctUntilChanged()
      .startWith(false)
      .shareReplay(1);

    this.canExecuteObservable = canExecute
      .combineLatest(this.isExecutingObservable, (ce, ie) => ce === true && ie === false)
      .catch(e => {
        const err = e instanceof Error ? e : new Error(e);
        this.thrownErrorsSubject.onNext(err);

        return asObservable(false);
      })
      .startWith(false)
      .distinctUntilChanged()
      .shareReplay(1);

    this.results = this.resultsSubject
      .share();

    this.thrownErrors = this.thrownErrorsSubject
      .share();
  }

  get isExecuting() {
    // COMPAT
    // let result: boolean | undefined;

    // this.isExecutingObservable
    //   .take(1)
    //   .subscribe(x => {
    //     result = x;
    //   });

    // if (result == null) {
    //   this.thrownErrorsSubject
    //     .onNext(new Error('isExecuting Observable has terminated abnormally'));

    //   result = false;
    // }

    // return result;
    return this.isExecutingObservable;
  }

  // COMPAT
  // get canExecute() {
  canExecute(parameter?: any) {
    let result: boolean | undefined;

    this.canExecuteObservable
      .take(1)
      .subscribe(x => {
        result = x;
      });

    if (result == null) {
      this.thrownErrorsSubject
        .onNext(new Error('canExecute Observable has terminated abnormally'));

      result = false;
    }

    return result;
  }

  observeExecution(parameter?: any) {
    if (this.canExecute() === false) {
      return Observable.throw<T>(new Error('canExecute currently forbids execution'));
    }

    return Observable
      .defer(() => {
        this.isExecutingSubject.onNext(true);

        return Observable.empty<T>();
      })
      .concat(
        Observable.defer(() => {
          return this.executeAction(parameter);
        }),
      )
      .do(
        x => {
          this.resultsSubject.onNext(x);
        },
        undefined,
        () => {
          this.isExecutingSubject.onNext(false);
        },
      )
      .catch(e => {
        const err = e instanceof Error ? e : new Error(e);
        this.thrownErrorsSubject.onNext(err);

        return Observable.empty<T>();
      })
      .share();
  }

  execute(
    parameter?: any,
    observerOrNext?: IObserver<T> | ((value: T) => void),
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ) {
    return this
      .observeExecution(parameter)
      .subscribeWith(observerOrNext, onError, onCompleted);
  }

  dispose() {
    this.isExecutingSubject = Object.dispose(this.isExecutingSubject);
    this.resultsSubject = Object.dispose(this.resultsSubject);
    this.thrownErrorsSubject = Object.dispose(this.thrownErrorsSubject);
  }

  // COMPAT
  executeAsync = this.observeExecution;
}

export function command<T>(
  execute: (parameter: any) => T | Observable<T> = (x: T) => x,
  canExecute?: Observable<boolean>,
): Command<T> {
  return new ObservableCommand((parameter: any) => asObservable(execute(parameter)), canExecute);
}
