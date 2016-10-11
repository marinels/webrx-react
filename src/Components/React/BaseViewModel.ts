import * as Rx from 'rx';
import * as wx from 'webrx';

import { LogLevel } from '../../Utils/Logging/LogLevel';
import { getLogger } from '../../Utils/Logging/LogManager';
import { SubMan } from '../../Utils/SubMan';
import { Default as alert } from '../../Utils/Alert';
import { Default as routeManager } from '../../Routing/RouteManager';

export interface LifecycleComponentViewModel {
  initializeViewModel(): void;
  loadedViewModel(): void;
  updatedViewModel(): void;
  cleanupViewModel(): void;
}

export abstract class BaseViewModel implements Rx.IDisposable {
  public static displayName = 'BaseViewModel';

  private isLoggingMemberObservables = false;

  protected subs = new SubMan();
  public stateChanged = wx.command();

  protected logger = getLogger(this.getDisplayName());

  // -----------------------------------------
  // These are special methods that handle the
  // lifecycle internally (do not override!!!)
  // -----------------------------------------
  // tslint:disable:no-unused-variable
  private initializeViewModel() {
    this.initialize();

    if (this.logger.level <= LogLevel.Debug && this.isLoggingMemberObservables === false) {
      this.isLoggingMemberObservables = true;

      this.logMemberObservables();
    }
  }

  private loadedViewModel() {
    this.loaded();
  }

  private updatedViewModel() {
    this.updated();
  }

  private cleanupViewModel() {
    this.cleanup();
  }
  // tslint:enable:no-unused-variable
  // -----------------------------------------

  protected initialize() {
    // do nothing by default
  }

  protected loaded() {
    // do nothing by default
  }

  protected updated() {
    // do nothing by default
  }

  protected cleanup() {
    // do nothing by default
  }

  public dispose() {
    this.subs.dispose();
  }

  public getDisplayName() { return Object.getName(this); }

  public createAlert(content: any, header?: string, style?: string, timeout?: number) {
    alert.create(content, header, style, timeout);
  }

  public alertForError<TError>(error: TError, header?: string, style?: string, timeout?: number, formatter?: (e: TError) => string) {
    alert.createForError(error, header, style, timeout, formatter);
  }

  public getObservableOrAlert<T, TError>(
    observableFactory: () => Rx.Observable<T>,
    header: string,
    style?: string,
    timeout?: number,
    errorFormatter?: (e: TError) => string) {

    return Rx.Observable
      .defer(observableFactory)
      .doOnError(err => {
        this.alertForError(err, header, style, timeout, errorFormatter);
      });
  }

  public getObservableResultOrAlert<TResult, TError>(
    resultFactory: () => TResult,
    header?: string,
    style?: string,
    timeout?: number,
    errorFormatter?: (e: TError) => string) {

    return Rx.Observable
      .defer(() => Rx.Observable.return(<TResult>resultFactory.call(this)))
      .doOnError(err => {
        this.alertForError(err, header, style, timeout, errorFormatter);
      });
  }

  public notifyChanged(...args: any[]) {
    this.stateChanged.execute(args);
  }

  private logMemberObservables() {
    let obj: { [key: string]: any } = this;
    let keys = Object.keys(obj);
    for (let i = 0; i < keys.length; ++i) {
      let member = obj[keys[i]];

      if (member != null) {
        let prop: { changed: Rx.Observable<any> } = member;
        let cmd: { results: Rx.Observable<any> } = member;

        if (prop.changed != null && prop.changed.subscribe instanceof Function) {
          this.logObservable(prop.changed, keys[i]);
        }
        else if (cmd.results != null && cmd.results.subscribe instanceof Function) {
          this.logObservable(cmd.results, `<${keys[i]}>`);
        }
      }
    }
  }

  protected logObservable(observable: Rx.Observable<any>, name: string) {
    this.subscribe(observable.subscribe(x => {
      if (x instanceof Object) {
        let value = Object.getName(x);

        if (value === 'Object') {
          value = '';
        }

        this.logger.debug(`${name} = ${value}`, x);
      }
      else {
        this.logger.debug(`${name} = ${x}`);
      }
    }));
  }

  protected subscribeOrAlert<T, TError>(
    observableFactory: () => Rx.Observable<T>,
    header: string,
    onNext: (value: T) => void,
    style?: string,
    timeout?: number,
    errorFormatter?: (e: TError) => string) {

    return this.subscribe(
      this.getObservableOrAlert(
        observableFactory,
        header,
        style,
        timeout,
        errorFormatter
      ).subscribe(x => {
        try {
          onNext(x);
        }
        catch (err) {
          this.alertForError(err, header, style, timeout, errorFormatter);
        }
      })
    );
  }

  protected subscribe(subscription: Rx.IDisposable) {
    this.subs.add(subscription);
    return subscription;
  }

  protected navTo(path: string, state?: any, uriEncode = false) {
    routeManager.navTo(path, state, uriEncode);
  }

  public bind<T>(observable: Rx.Observable<T>, command: wx.ICommand<T>) {
    return this.subscribe(observable.invokeCommand(command));
  }
}
