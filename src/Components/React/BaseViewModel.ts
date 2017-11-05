import { Observable, Subscription } from 'rxjs';
import { TeardownLogic } from 'rxjs/Subscription';

import { wx, Command } from '../../WebRx';
import { Logging, Alert } from '../../Utils';
import { routeManager } from '../../Routing/RouteManager';

export interface ViewModelLifecyle {
  initializeViewModel(): void;
  loadedViewModel(): void;
  updatedViewModel(): void;
  cleanupViewModel(): void;
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

export abstract class BaseViewModel extends Subscription {
  public static displayName = 'BaseViewModel';

  // these are WebRx helper functions (so you don't need to import them every time)
  public static readonly wx = wx;
  protected readonly wx = wx;

  // these are Alert helper functions
  protected readonly createAlert = Alert.create;
  protected readonly alertForError = Alert.createForError;

  protected readonly logger: Logging.Logger = Logging.getLogger(this.getDisplayName());
  private isLoggingMemberObservables = false;

  public readonly stateChanged: Command<any>;

  constructor() {
    super();

    this.stateChanged = this.wx.command();
  }

  // -----------------------------------------
  // These are special methods that handle the
  // lifecycle internally (do not override!!!)
  // -----------------------------------------
  private initializeViewModel() {
    this.initialize();

    if (this.logger.level <= Logging.LogLevel.Debug && this.isLoggingMemberObservables === false) {
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
    routeManager.navTo(path, state, replace, uriEncode);
  }

  public isViewModel() {
    return true;
  }

  public getDisplayName() { return Object.getName(this); }
}
