import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs';
import { PartialObserver } from 'rxjs/Observer';

import { Command, ObservableOrValue } from './Interfaces';
import { isObservable, asObservable, handleError } from './Utils';

export type ExecutionAction<T = any> = (parameter: any) => ObservableOrValue<T>;
export type InterrogationAction<T = any> = (condition: T, parameter?: any) => boolean;

export class ObservableCommand<T = any, TCondition = any> extends Subscription implements Command<T, TCondition> {
  static coerceCondition<T>(condition: T) {
    if (typeof condition === 'boolean') {
      return condition;
    }

    return condition != null;
  }

  protected isExecutingSubject: BehaviorSubject<boolean>;
  protected conditionSubject: BehaviorSubject<TCondition | undefined>;
  protected canExecuteSubject: BehaviorSubject<boolean>;
  protected requestsSubject: Subject<T>;
  protected resultsSubject: Subject<T>;
  protected thrownErrorsSubject: Subject<Error>;

  constructor(
    protected readonly executeAction: ExecutionAction<T>,
    protected readonly interrogationAction: InterrogationAction<TCondition | undefined> = x => ObservableCommand.coerceCondition(x),
    private condition?: Observable<TCondition>,
    private initialCondition?: TCondition,
  ) {
    super();

    this.isExecutingSubject = this.addSubscription(new BehaviorSubject<boolean>(false));
    this.conditionSubject = this.addSubscription(new BehaviorSubject<TCondition | undefined>(initialCondition));

    this.requestsSubject = this.addSubscription(new Subject<T>());
    this.resultsSubject = this.addSubscription(new Subject<T>());
    this.thrownErrorsSubject = this.addSubscription(new Subject<Error>());

    if (condition != null) {
      this.add(
        condition
          .subscribe(this.conditionSubject),
      );
    }

    this.canExecuteSubject = this.addSubscription(new BehaviorSubject<boolean>(
      condition == null || this.conditionValue == null || this.interrogationAction(this.conditionValue),
    ));

    const canExecute = condition == null ?
      asObservable(true) :
      this.conditionSubject.map(x => this.interrogationAction(x));

    this.add(
      canExecute
        .combineLatest(
          this.isExecutingSubject,
          (ce, ie) => ce === true && ie === false)
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

  get conditionObservable() {
    return this.conditionSubject
      .distinctUntilChanged();
  }

  get canExecuteObservable() {
    return this.canExecuteSubject
      .distinctUntilChanged();
  }

  get conditionValue() {
    return this.conditionSubject.getValue();
  }

  get canExecute() {
    return this.canExecuteSubject.getValue();
  }

  isCommand() {
    return true;
  }

  canExecuteFor(parameter: any) {
    return this.interrogationAction(
      this.conditionSubject.getValue(),
      parameter,
    );
  }

  observeExecution(parameter?: any): Observable<T> {
    if (this.canExecute === false) {
      const error = new Error('canExecute currently forbids execution');

      handleError(error);

      return Observable.throw(error);
    }

    return Observable
      .of(parameter)
      .do(x => {
        this.requestsSubject.next(x);
        this.isExecutingSubject.next(true);
      })
      .flatMap(x => {
        return asObservable(this.executeAction(x));
      })
      .do(
        x => {
          this.resultsSubject.next(x);

          this.isExecutingSubject.next(false);
        },
        e => {
          // capture the error, but don't swallow it
          handleError(e, this.thrownErrorsSubject);

          this.isExecutingSubject.next(false);
        },
        () => {
          this.isExecutingSubject.next(false);
        },
      )
      // this will prevent execution if nobody is subscribing to the result
      .share();
  }

  execute(
    parameter?: any,
    observer?: PartialObserver<T>,
  ): Subscription;

  execute(
    parameter?: any,
    next?: (value: T) => void,
    error?: (error: any) => void,
    complete?: () => void,
  ): Subscription;

  execute(
    parameter?: any,
    observerOrNext?: PartialObserver<T> | ((value: T) => void),
    error: (error: any) => void = () => { return; },
    complete?: () => void,
  ): Subscription {
    const obs = this
      .observeExecution(parameter);

    return obs
      .subscribe.apply(obs, [ observerOrNext, error, complete ]);
  }

  get requests() {
    return this.requestsSubject
      .asObservable();
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

export function command<T = any>(): Command<T>;
export function command<T>(execute: ExecutionAction<T>): Command<T>;
export function command<T>(canExecute: Observable<boolean>, execute?: ExecutionAction<T>): Command<T>;
export function command<T>(execute: ExecutionAction<T>, canExecute: Observable<boolean>): Command<T>;
export function command<T, TCondition>(
  execute: ExecutionAction<T>,
  condition: Observable<TCondition>,
  interrogation: InterrogationAction<TCondition>,
  initialCondition?: TCondition,
): Command<T>;
export function command<T>(
  arg1?: ExecutionAction<T> | Observable<any>,
  arg2?: ExecutionAction<T> | Observable<any>,
  interrogation?: InterrogationAction<any>,
  initialCondition?: any,
): Command<T> {
  let condition: Observable<any> | undefined;
  let execute: ExecutionAction<T> = (x: T) => x;

  if (isObservable(arg1)) {
    condition = arg1;

    if (arg2 instanceof Function) {
      execute = arg2;
    }
  }
  else if (isObservable(arg2)) {
    condition = arg2;

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

  if (condition == null) {
    initialCondition = true;
  }

  return new ObservableCommand(
    execute,
    interrogation,
    condition,
    initialCondition,
  );
}
