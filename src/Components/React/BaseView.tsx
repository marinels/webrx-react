import * as React from 'react';
import { Observable, IDisposable } from 'rx';

import { Property, Command } from '../../WebRx';
import { ReactSpreadResult } from '../../Extensions/React';
import { Alert, Logging, SubMan } from '../../Utils';
import { BaseViewModel, LifecycleComponentViewModel } from './BaseViewModel';
import { renderEnumerable, renderConditional, renderNullable, renderLoadable, renderSizedLoadable, renderGridLoadable, focusElement, classNames } from './RenderHelpers';
import { bindObservableToCommand, bindEventToProperty, bindEventToCommand } from './BindingHelpers';

export interface ViewModelProps {
  viewModel: Readonly<BaseViewModel>;
}

export interface BaseViewProps extends React.HTMLProps<any>, ViewModelProps {
}

export abstract class BaseView<TViewProps extends ViewModelProps, TViewModel extends BaseViewModel> extends React.Component<TViewProps, TViewModel> implements IDisposable {
  public static displayName = 'BaseView';

  private updateSubscription: IDisposable | undefined;

  // -----------------------------------------
  // these are render helper methods
  // -----------------------------------------
  protected readonly renderEnumerable = renderEnumerable;
  protected readonly renderConditional = renderConditional;
  protected readonly renderNullable = renderNullable;
  protected readonly renderLoadable = renderLoadable;
  protected readonly renderSizedLoadable = renderSizedLoadable;
  protected readonly renderGridLoadable = renderGridLoadable;
  protected readonly focusElement = focusElement;
  protected readonly classNames = classNames;

  // these are Alert helper functions
  protected readonly createAlert = Alert.create;
  protected readonly alertForError = Alert.createForError;

  protected readonly logger: Logging.Logger = Logging.getLogger(this.getDisplayName());
  protected readonly subs: SubMan;

  constructor(props?: TViewProps | undefined, context?: any) {
    super(props, context);

    this.subs = new SubMan();

    if (props != null) {
      this.state = props.viewModel as TViewModel;
    }
  }

  private logRender(initial: boolean) {
    this.logger.debug(`${ initial ? '' : 're-' }rendering`);
  }

  private subscribeToUpdates() {
    let updateProps = this.updateOn();
    updateProps.push(this.state.stateChanged.results);

    this.updateSubscription = Observable
      .merge(updateProps)
      .debounce(this.getRateLimit())
      .subscribe(() => {
        this.renderView();
      }, x => {
        this.alertForError(x);
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

  componentDidUpdate(prevProps: TViewProps, prevState: TViewModel, prevContext: any) {
    this.updatedView(prevProps);
  }

  componentWillUnmount() {
    this.cleanupView();

    this.dispose();
  }
  // -----------------------------------------

  // -----------------------------------------
  // these are internal lifecycle functions
  // NOTE: we use 'as any as LifecycleComponentViewModel' because the methods are private
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

  protected addSubscription(subscription: IDisposable) {
    return this.subs.add(subscription);
  }

  protected addManySubscriptions(...subscriptions: IDisposable[]) {
    return this.subs.addMany(...subscriptions);
  }

  public dispose() {
    this.subs.dispose();

    this.updateSubscription = Object.dispose(this.updateSubscription);
  }

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
  protected bindObservableToCommand<TInput, TResult>(observable: Observable<TInput>, commandSelector: (viewModel: Readonly<TViewModel>) => Command<TResult>) {
    return bindObservableToCommand(this.state, observable, commandSelector);
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  protected bindEventToProperty<TValue, TEvent extends Event | React.SyntheticEvent<this>>(
    targetSelector: (viewModel: Readonly<TViewModel>) => Property<TValue>,
    valueSelector?: (eventKey: any, event: TEvent) => TValue,
  ) {
    return bindEventToProperty(this.state, targetSelector, valueSelector);
  }

  /**
   * Binds a DOM event to an observable command on the view model
   */
  protected bindEventToCommand<TParameter, TEvent extends Event | React.SyntheticEvent<this>>(
    commandSelector: (viewModel: Readonly<TViewModel>) => Command<any>,
    paramSelector?: (eventKey: any, event: TEvent) => TParameter,
    conditionSelector?: (event: TEvent, eventKey: any) => boolean,
  ) {
    return bindEventToCommand(this.state, commandSelector, paramSelector, conditionSelector);
  }
  // -----------------------------------------
}
