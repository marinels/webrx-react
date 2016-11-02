import * as React from 'react';
import { Observable, IDisposable } from 'rx';
import * as wx from 'webrx';

import { getLogger } from '../../Utils/Logging/LogManager';
import { BaseViewModel, LifecycleComponentViewModel } from './BaseViewModel';
import * as bindingHelpers from './BindingHelpers';
import * as renderHelpers from './RenderHelpers';

export interface BaseViewProps extends React.HTMLAttributes {
  viewModel: BaseViewModel;
}

export abstract class BaseView<TViewProps extends BaseViewProps, TViewModel extends BaseViewModel> extends React.Component<TViewProps, TViewModel> {
  public static displayName = 'BaseView';

  private updateSubscription: IDisposable;

  // -----------------------------------------
  // these are render helper methods
  // -----------------------------------------
  protected renderEnumerable = renderHelpers.renderEnumerable;
  protected renderConditional = renderHelpers.renderConditional;
  protected renderLoadable = renderHelpers.renderLoadable;
  protected renderSizedLoadable = renderHelpers.renderSizedLoadable;

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

    this.updateSubscription = Observable
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
    let state = nextProps.viewModel as TViewModel;

    // if the view model changed we need to do some teardown and setup
    if (state !== this.state) {
      this.logger.info('ViewModel Change Detected');

      // cleanup old view model
      (this.state as any as LifecycleComponentViewModel).cleanupViewModel();
      this.updateSubscription = Object.dispose(this.updateSubscription);

      // set our new view model as the current state and initialize it
      this.state = state;
      (this.state as any as LifecycleComponentViewModel).initializeViewModel();

      // now sub to the view model observables
      this.subscribeToUpdates();

      // this is effectively a state change so we want to force a re-render
      this.forceUpdate();

      // finally inform the view model it has been loaded
      (this.state as any as LifecycleComponentViewModel).loadedViewModel();
    }
  }

  componentWillUpdate(nextProps: TViewProps, nextState: TViewModel, nextContext: any) {
    this.updatingView(nextProps);
    this.logRender(false);
  }

  componentDidUpdate(prevProps: TViewProps, prevState: TViewModel) {
    this.updatedView(prevProps);
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

  private updatingView(nextProps: TViewProps) {
    this.updating(nextProps);
  }

  private updatedView(prevProps: TViewProps) {
    this.updated(prevProps);
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

  protected updating(nextProps: TViewProps) {
    // do nothing by default
  }

  protected updated(prevProps: TViewProps) {
    // do nothing by default
  }

  protected cleanup() {
    // do nothing by default
  }
  // -----------------------------------------

  // -----------------------------------------
  // this is the property destruction helper
  // this functions will remove key, ref, and viewModel props automatically
  // -----------------------------------------

  public restProps<T>(propsCreator?: (x: TViewProps) => T, ...omits: string[]) {
    return super.restProps(propsCreator, ...omits.concat('viewModel'));
  }
  // -----------------------------------------

  // -----------------------------------------
  // these overridable view functions
  // -----------------------------------------
  protected updateOn(): Observable<any>[] { return []; }

  protected getDisplayName() { return Object.getName(this); }
  protected getRateLimit() { return 100; }

  protected renderView() { this.forceUpdate(); }
  // -----------------------------------------

  // -----------------------------------------
  // these are binding helper methods
  // -----------------------------------------
  /**
   * Binds an observable to a command on the view model
   */
  protected bindObservableToCommand<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Observable<TResult>) {
    return bindingHelpers.bindObservableToCommand(this.state, commandSelector, observable);
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  protected bindEventToProperty<TValue, TEvent extends Event | React.SyntheticEvent>(
    targetSelector: (viewModel: TViewModel) => wx.IObservableProperty<TValue>,
    valueSelector?: (eventKey: any, event: TEvent) => TValue
  ) {
    return bindingHelpers.bindEventToProperty(this, this.state, targetSelector, valueSelector);
  }

  /**
   * Binds a DOM event to an observable command on the view model
   */
  protected bindEventToCommand<TParameter, TEvent extends Event | React.SyntheticEvent>(
    commandSelector: (viewModel: TViewModel) => wx.ICommand<any>,
    paramSelector?: (eventKey: any, event: TEvent) => TParameter,
    conditionSelector?: (event: TEvent, eventKey: any) => boolean
  ) {
    return bindingHelpers.bindEventToCommand(this, this.state, commandSelector, paramSelector, conditionSelector);
  }
  // -----------------------------------------
}
