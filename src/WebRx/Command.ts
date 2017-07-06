import { Observable, Subject, BehaviorSubject, Observer, Subscription } from 'rxjs';

import { Command } from './Interfaces';
import { isObservable, asObservable, handleError } from './Utils';

export class ObservableCommand<T> extends Subscription implements Command<T> {
  protected isExecutingSubject: BehaviorSubject<boolean>;
  protected canExecuteSubject: BehaviorSubject<boolean>;
  protected resultsSubject: Subject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  constructor(
    protected readonly executeAction: (parameter: any) => Observable<T>,
    canExecute?: Observable<boolean>,
  ) {
    super();

    this.isExecutingSubject = this.addSubscription(new BehaviorSubject<boolean>(false));
    this.canExecuteSubject = this.addSubscription(new BehaviorSubject<boolean>(canExecute == null));
    this.resultsSubject = this.addSubscription(new Subject<T>());
    this.thrownErrorsSubject = this.addSubscription(new Subject<Error>());

    this.add((canExecute || asObservable(true))
      .combineLatest(this.isExecutingSubject, (ce, ie) => ce === true && ie === false)
      .catch(e => {
        handleError(e, this.thrownErrorsSubject);

        return asObservable(false);
      })
      .distinctUntilChanged()
      .subscribe(this.canExecuteSubject),
    );
  }

  get isExecutingObservable() {
    return this.isExecutingSubject
      .distinctUntilChanged();
  }

  get isExecuting() {
    return this.isExecutingSubject.getValue();
  }

  get canExecuteObservable() {
    return this.canExecuteSubject
      .distinctUntilChanged();
  }

  get canExecute() {
    return this.canExecuteSubject.getValue();
  }

  isCommand() {
    return true;
  }

  observeExecution(parameter?: any): Observable<T> {
    if (this.canExecute === false) {
      return Observable.throw(new Error('canExecute currently forbids execution'));
    }

    return Observable
      .of(parameter)
      .do(() => {
        this.isExecutingSubject.next(true);
      })
      .flatMap(x => {
        return this.executeAction(x);
      })
      .do(x => {
        this.resultsSubject.next(x);
      })
      .do(
        () => {
          this.isExecutingSubject.next(false);
        },
        () => {
          this.isExecutingSubject.next(false);
        },
        () => {
          this.isExecutingSubject.next(false);
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
    observerOrNext?: Observer<T>,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ): Subscription;

  execute(
    parameter?: any,
    onNext?: (value: T) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ): Subscription;

  execute(
    parameter?: any,
    observerOrNext?: Observer<T> | ((value: T) => void),
    onError: (exception: any) => void = e => handleError(e, this.thrownErrorsSubject),
    onCompleted?: () => void,
  ): Subscription {
    const obs = this
      .observeExecution(parameter);

    return obs
      .subscribe.apply(obs, [ observerOrNext, onError, onCompleted ]);
  }

  get results() {
    return this.resultsSubject
      .asObservable();
  }

  get thrownErrors() {
    return this.thrownErrorsSubject
      .asObservable();
  }
}

export type ExecutionAction<T> = (parameter: any) => (T | Observable<T>);

export function command<T>(): Command<T>;
export function command<T>(execute: ExecutionAction<T>): Command<T>;
export function command<T>(canExecute: Observable<boolean>, execute?: ExecutionAction<T>): Command<T>;
export function command<T>(execute: ExecutionAction<T>, canExecute: Observable<boolean>): Command<T>;
export function command<T>(arg1?: ExecutionAction<T> | Observable<boolean>, arg2?: ExecutionAction<T> | Observable<boolean>): Command<T> {
  let canExecute: Observable<boolean> | undefined;
  let execute: ExecutionAction<T> = (x: T) => x;

  if (isObservable(arg1)) {
    canExecute = arg1;

    if (arg2 instanceof Function) {
      execute = arg2;
    }
  }
  else if (isObservable(arg2)) {
    canExecute = arg2;

    if (arg1 instanceof Function) {
      execute = arg1;
    }
  }
  else {
    // no boolean observable passed in for can execute
    // just check if arg1 is a function
    if (arg1 instanceof Function) {
      execute = arg1;
    }
  }

  return new ObservableCommand((parameter: any) => asObservable(execute(parameter)), canExecute);
}
