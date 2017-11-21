import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { AnonymousSubscription, TeardownLogic } from 'rxjs/Subscription';

import { wx, WebRxStatic, Property, Command } from '../../WebRx';
import { Logger, LogLevel, getLogger } from '../../Utils/Logging';
import { Alert, PubSub } from '../../Utils';
import { RoutingStateChangedKey } from '../../Events';
import { routeManager, RouteManager } from '../../Routing/RouteManager';
import { ViewModelLifecyle, HandlerRoutingStateChanged, RoutingStateHandler } from './Interfaces';

export function isRoutingStateHandler(value: any): value is RoutingStateHandler<{}> {
  if (value == null) {
    return false;
  }

  const handler: RoutingStateHandler<{}> = value;

  return (
    handler.isRoutingStateHandler instanceof Function &&
    handler.isRoutingStateHandler()
  );
}

export function isViewModelLifecycle(viewModel: any): viewModel is ViewModelLifecyle {
  return (
    viewModel.initializeViewModel instanceof Function &&
    viewModel.loadedViewModel instanceof Function &&
    viewModel.updatedViewModel instanceof Function &&
    viewModel.cleanupViewModel instanceof Function
  );
}

export function isViewModel(source: any): source is BaseViewModel {
  const viewModel = <BaseViewModel>source;

  if (viewModel != null && viewModel.isViewModel instanceof Function) {
    return viewModel.isViewModel();
  }
  else {
    return false;
  }
}

export function getRoutingStateValue<T>(value: T | null | undefined, defaultValue?: T): T | undefined;
export function getRoutingStateValue<T, R>(value: T | null | undefined, selector: (x: T) => R): R | undefined;
export function getRoutingStateValue<T, R>(value: T | null | undefined, defaultValue: T, selector: (x: T) => R): R | undefined;
export function getRoutingStateValue<T, R>(value: T | null | undefined, arg2?: T | ((x: T) => R), selector?: (x: T) => R): R | undefined {
  if (value == null) {
    return undefined;
  }

  if (arg2 instanceof Function) {
    return arg2(value);
  }

  if (arg2 != null && value === arg2) {
    return undefined;
  }

  if (selector != null) {
    return selector(value);
  }

  // we need a direct cast here because no selector was supplied
  // this just means that T === R
  return <any>value;
}

export type RoutingStateValueCreator = typeof getRoutingStateValue;

export abstract class BaseViewModel extends Subscription {
  public static displayName = 'BaseViewModel';

  // WebRx helper functions (so you don't need to import them every time)
  public static readonly wx: WebRxStatic = wx;

  protected readonly logger: Logger;
  protected readonly wx: WebRxStatic;

  // helper function for creating routing state values
  protected readonly getRoutingStateValue: RoutingStateValueCreator;

  // these are Alert helper functions
  protected readonly createAlert: Alert.AlertCreator;
  protected readonly alertForError: Alert.ErrorAlertCreator;

  protected readonly routeManager: RouteManager;

  private isLoggingMemberObservables: boolean;

  public stateChanged: Command<HandlerRoutingStateChanged> | undefined;

  constructor(unsubscribe?: () => void) {
    super(unsubscribe);

    this.logger = getLogger(this.getDisplayName());
    this.wx = wx;
    this.getRoutingStateValue = getRoutingStateValue;
    this.createAlert = Alert.create;
    this.alertForError = Alert.createForError;
    this.routeManager = routeManager;
    this.isLoggingMemberObservables = false;
  }

  // -----------------------------------------
  // These are special methods that handle the
  // lifecycle internally (do not override!!!)
  // -----------------------------------------
  private initializeViewModel() {
    this.initialize();

    this.initializeRoutingStateHandler(this);

    if (this.logger.level <= LogLevel.Debug && this.isLoggingMemberObservables === false) {
      this.isLoggingMemberObservables = true;

      this.addSubscriptions(...this.wx.logMemberObservables(this.logger, this));
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

  protected initializeRoutingStateHandler(source: this) {
    if (isRoutingStateHandler(source)) {
      this.stateChanged = this.wx.command(context => {
        const stateChanged: HandlerRoutingStateChanged = {
          source,
          context,
        };

        PubSub.publish(RoutingStateChangedKey, stateChanged);

        return stateChanged;
      });
    }
  }

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

  protected notifyChanged(context?: any) {
    if (this.stateChanged != null) {
      this.stateChanged.execute(context);
    }
  }

  protected navTo(path: string, state?: any, replace = false, uriEncode = false) {
    this.routeManager.navTo(path, state, replace, uriEncode);
  }

  public isViewModel() {
    return true;
  }

  public getDisplayName() { return Object.getName(this); }
}
