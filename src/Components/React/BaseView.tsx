import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';

import { getLogger } from '../../Utils/Logging/LogManager';
import { BaseViewModel, LifecycleComponentViewModel } from './BaseViewModel';

export interface IBaseViewProps extends React.HTMLAttributes {
  viewModel: BaseViewModel;
}

export abstract class BaseView<TViewProps extends IBaseViewProps, TViewModel extends BaseViewModel> extends React.Component<TViewProps, TViewModel> {
  public static displayName = 'BaseView';

  private updateSubscription: Rx.IDisposable;

  protected logger = getLogger(this.getDisplayName());

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.state = props.viewModel as TViewModel;
  }

  private logRender(initial: boolean) {
    this.logger.debug(`${initial ? '' : 're-'}rendering`);
  }

  private subscribeToUpdates() {
    let updateProps = this.updateOn();
    updateProps.push(this.state.stateChanged.results);

    this.updateSubscription = Rx.Observable
      .fromArray(updateProps)
      .selectMany(x => x)
      .debounce(this.getRateLimit())
      .subscribe(x => {
        this.renderView();
      }, x => {
        this.state.alertForError(x);
      });
  }

  // -----------------------------------------
  // these are react lifecycle functions
  // -----------------------------------------
  componentWillMount() {
    this.initializeView();

    this.subscribeToUpdates();

    this.logRender(true);
  }

  componentDidMount() {
    this.loadedView();
  }

  componentWillReceiveProps(nextProps: TViewProps, nextContext: any) {
    let state = nextProps.viewModel;

    // TODO: need to find a better way to handle this case...
    if (state !== this.state) {
      this.logger.debug('ViewModel Change Detected');

      // cleanup old view model
      (this.state as any as LifecycleComponentViewModel).cleanupViewModel();
      this.updateSubscription = Object.dispose(this.updateSubscription);

      // set our new view model as the current state and initialize it
      this.state = state as TViewModel;
      (this.state as any as LifecycleComponentViewModel).initializeViewModel();
      this.subscribeToUpdates();

      this.forceUpdate();

      (this.state as any as LifecycleComponentViewModel).loadedViewModel();
    }
  }

  componentWillUpdate(nextProps: TViewProps, nextState: TViewModel, nextContext: any) {
    this.logRender(false);
  }

  componentWillUnmount() {
    this.cleanupView();

    this.updateSubscription = Object.dispose(this.updateSubscription);
  }
  // -----------------------------------------

  // -----------------------------------------
  // these are internal lifecycle functions
  // -----------------------------------------
  private initializeView() {
    (this.state as any as LifecycleComponentViewModel).initializeViewModel();
    this.initialize();
  }

  private loadedView() {
    this.loaded();
    (this.state as any as LifecycleComponentViewModel).loadedViewModel();
  }

  private cleanupView() {
    this.cleanup();
    (this.state as any as LifecycleComponentViewModel).cleanupViewModel();
  }
  // -----------------------------------------

  // -----------------------------------------
  // these are overridable lifecycle functions
  // -----------------------------------------
  protected initialize() {
    // do nothing by default
  }

  protected loaded() {
    // do nothing by default
  }

  protected cleanup() {
    // do nothing by default
  }
  // -----------------------------------------

  // -----------------------------------------
  // these overridable view functions
  // -----------------------------------------
  protected updateOn(): Rx.Observable<any>[] { return []; }

  protected getDisplayName() { return Object.getName(this); }
  protected getRateLimit() { return 100; }

  protected renderView() { this.forceUpdate(); }
  // -----------------------------------------

  /**
   * Binds an observable to a command on the view model
   */
  public bindObservableToCommand<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Rx.Observable<TResult>) {
    return this.state.bind(observable, commandSelector(this.state));
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  public bindEventToProperty<TValue, TEvent extends Event | React.SyntheticEvent>(
    targetSelector: (viewModel: TViewModel) => wx.IObservableProperty<TValue>,
    valueSelector?: (eventKey: any, event: TEvent) => TValue
  ) {
    return (eventKey: any, event: TEvent) => {
      if (event == null) {
        // this ensures that we can still use this function for basic HTML events
        event = eventKey;
      }

      const prop = targetSelector.apply(this, [ this.state ]) as wx.IObservableProperty<TValue>;
      const value = (valueSelector == null ? eventKey : valueSelector.apply(this, [ eventKey, event ])) as TValue;

      prop(value);
    };
  }

  /**
   * Binds a DOM event to an observable command on the view model
   */
  public bindEventToCommand<TParameter, TEvent extends Event | React.SyntheticEvent>(
    commandSelector: (viewModel: TViewModel) => wx.ICommand<any>,
    paramSelector?: (eventKey: any, event: TEvent) => TParameter,
    conditionSelector?: (event: TEvent, eventKey: any) => boolean
  ) {
    return (eventKey: any, event: Event) => {
      if (event == null) {
        // this ensures that we can still use this function for basic HTML events
        event = eventKey;
      }

      const param = (paramSelector == null ? eventKey : paramSelector.apply(this, [ eventKey, event ])) as TParameter;
      const canExecute = conditionSelector == null || (conditionSelector.apply(this, [ event, eventKey ]) as boolean);

      if (canExecute) {
        const cmd = commandSelector.apply(this, [ this.state ]) as wx.ICommand<any>;

        cmd.execute(param);
      }
    };
  }
}
