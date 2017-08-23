import { Observable, Subscription } from 'rxjs';
import { TeardownLogic } from 'rxjs/Subscription';

import { property } from '../../WebRx/Property';
import { command } from '../../WebRx/Command';
import { whenAny } from '../../WebRx/WhenAny';
import {
  isObservable, isObserver, isSubject, isProperty, isCommand, asObservable,
  getObservable, getProperty, handleError,
} from '../../WebRx/Utils';
import { ObservableLike, Command } from '../../WebRx';
import { Logging, Alert } from '../../Utils';
import { Manager } from '../../Routing/RouteManager';
import { getObservableOrAlert, getObservableResultOrAlert, subscribeOrAlert, logMemberObservables } from './ObservableHelpers';

export interface LifecycleComponentViewModel {
  initializeViewModel(): void;
  loadedViewModel(): void;
  updatedViewModel(): void;
  cleanupViewModel(): void;
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

export abstract class BaseViewModel extends Subscription {
  public static displayName = 'BaseViewModel';

  // these are WebRx helper functions (so you don't need to import them every time)
  protected readonly isObservable = isObservable;
  protected readonly isObserver = isObserver;
  protected readonly isSubject = isSubject;
  protected readonly isProperty = isProperty;
  protected readonly isCommand = isCommand;
  protected readonly asObservable = asObservable;
  protected readonly getObservable = getObservable;
  protected readonly getProperty = getProperty;
  protected readonly handleError = handleError;
  protected readonly property = property;
  protected readonly command = command;
  protected readonly whenAny = whenAny;

  // these are Alert helper functions
  protected readonly createAlert = Alert.create;
  protected readonly alertForError = Alert.createForError;

  // these are Observable helper functions
  protected readonly getObservableOrAlert = getObservableOrAlert;
  protected readonly getObservableResultOrAlert = getObservableResultOrAlert;
  protected readonly subscribeOrAlert = subscribeOrAlert;

  protected readonly logger: Logging.Logger = Logging.getLogger(this.getDisplayName());
  private isLoggingMemberObservables = false;

  public readonly stateChanged: Command<any>;

  constructor() {
    super();

    this.stateChanged = this.command();
  }

  // -----------------------------------------
  // These are special methods that handle the
  // lifecycle internally (do not override!!!)
  // -----------------------------------------
  private initializeViewModel() {
    this.initialize();

    if (this.logger.level <= Logging.LogLevel.Debug && this.isLoggingMemberObservables === false) {
      this.isLoggingMemberObservables = true;

      this.addSubscriptions(...logMemberObservables(this.logger, this));
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

  protected notifyChanged(arg?: any) {
    this.stateChanged.execute(arg);
  }

  protected navTo(path: string, state?: any, replace = false, uriEncode = false) {
    Manager.navTo(path, state, replace, uriEncode);
  }

  public isViewModel() {
    return true;
  }

  public getDisplayName() { return Object.getName(this); }
}
