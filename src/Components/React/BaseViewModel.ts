import { Observable, IDisposable } from 'rx';

import { wx, ObservableOrProperty, Command } from '../../WebRx';
import { Logging, Alert, SubMan } from '../../Utils';
import { Manager } from '../../Routing/RouteManager';
import { wxr } from './StaticHelpers';

export interface LifecycleComponentViewModel {
  initializeViewModel(): void;
  loadedViewModel(): void;
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

export abstract class BaseViewModel implements IDisposable {
  public static displayName = 'BaseViewModel';

  // these are WebRx helper functions (so you don't need to import them every time)
  protected readonly property = wx.property;
  protected readonly command = wx.command;
  protected readonly getObservable = wx.getObservable;
  protected readonly getProperty = wx.getProperty;
  protected readonly isProperty = wx.isProperty;
  protected readonly isCommand = wx.isCommand;
  protected readonly whenAny = wx.whenAny;

  // these are Alert helper functions
  protected readonly createAlert = Alert.create;
  protected readonly alertForError = Alert.createForError;

  // these are Observable helper functions
  protected readonly getObservableOrAlert = wxr.getObservableOrAlert;
  protected readonly getObservableResultOrAlert = wxr.getObservableResultOrAlert;
  protected readonly subscribeOrAlert = wxr.subscribeOrAlert;

  protected readonly logger = Logging.getLogger(this.getDisplayName());
  private isLoggingMemberObservables = false;

  protected readonly subs: SubMan;
  public readonly stateChanged: Command<any>;

  constructor() {
    this.subs = new SubMan();
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

      this.addManySubscriptions(...wxr.logMemberObservables(this.logger, this));
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

  protected addSubscription(subscription: IDisposable) {
    return this.subs.add(subscription);
  }

  protected addManySubscriptions(...subscriptions: IDisposable[]) {
    return this.subs.addMany(...subscriptions);
  }

  protected navTo(path: string, state?: any, replace = false, uriEncode = false) {
    Manager.navTo(path, state, replace, uriEncode);
  }

  public isViewModel() {
    return true;
  }

  public dispose() {
    this.subs.dispose();
  }

  public getDisplayName() { return Object.getName(this); }

  public bindObservable<T>(observable: ObservableOrProperty<T>, subscriptionSelector: (x: Observable<T>) => IDisposable) {
    return this.addSubscription(subscriptionSelector(this.getObservable(observable)));
  }
}
