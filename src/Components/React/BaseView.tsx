import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { AnonymousSubscription, TeardownLogic } from 'rxjs/Subscription';

import { Property, Command } from '../../WebRx';
import { ReactSpreadResult } from '../../Extensions/React';
import { Alert, Logging } from '../../Utils';
import { BaseViewModel, ViewModelLifecyle, isViewModelLifecycle } from './BaseViewModel';
import { renderIterable, renderConditional, renderNullable, renderLoadable, renderSizedLoadable, renderGridLoadable, focusElement, classNames } from './RenderHelpers';
import { bindObservableToCommand, bindEventToProperty, bindEventToCommand } from './BindingHelpers';

export interface ViewModelProps<T extends BaseViewModel> {
  viewModel: Readonly<T>;
}

export interface BaseViewProps<TViewModel extends BaseViewModel, TView> extends ViewModelProps<TViewModel>, React.HTMLProps<TView> {
}

export interface ViewModelState<T extends BaseViewModel> {
  viewModel: T;
}

export abstract class BaseView<TViewProps extends ViewModelProps<TViewModel>, TViewModel extends BaseViewModel> extends React.Component<TViewProps, ViewModelState<TViewModel>> implements AnonymousSubscription {
  public static displayName = 'BaseView';

  private updateSubscription: Subscription;
  private subscriptions: Subscription;

  // -----------------------------------------
  // these are render helper methods
  // -----------------------------------------
  protected readonly renderIterable = renderIterable;
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

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.updateSubscription = this.subscriptions = Subscription.EMPTY;
    this.subscriptions = new Subscription();

    if (props != null) {
      this.state = this.createStateFromProps(props);
    }
  }

  public get viewModel() {
    return this.getViewModelFromState(this.state);
  }

  private getSubscriptions() {
    if (this.subscriptions === Subscription.EMPTY) {
      this.subscriptions = new Subscription();
    }

    return this.subscriptions;
  }

  // -----------------------------------------
  // these are react lifecycle functions
  // -----------------------------------------
  componentWillMount() {
    this.initializeView();

    this.subscribeToUpdates(this.props, this.state);

    this.logger.debug('rendering');
  }

  componentDidMount() {
    this.loadedView();
  }

  componentWillReceiveProps(nextProps: Readonly<TViewProps>, nextContext: any) {
    // if the view model changed we need to do some teardown and setup
    if (nextProps.viewModel !== this.viewModel) {
      this.logger.info('ViewModel Change Detected');

      // unsubscribe from updates
      this.updateSubscription = Subscription.unsubscribe(this.updateSubscription);

      // ask react to generate new state from the updated props
      this.setState((prevState, props) => {
        return this.createStateFromProps(props);
      });
    }
  }

  componentWillUpdate(nextProps: Readonly<TViewProps>, nextState: Readonly<ViewModelState<TViewModel>>, nextContext: any) {
    this.updatingView(nextProps, nextState);

    // check if we need to re-subscripe to updates (if our view model changed)
    if (this.updateSubscription === Subscription.EMPTY) {
      // get the next view model
      const nextViewModel = this.getViewModelFromState(nextState);

      // cleanup the old view model
      if (isViewModelLifecycle(this.viewModel)) {
        this.viewModel.cleanupViewModel();
      }

      // then initialize the view model
      if (isViewModelLifecycle(nextViewModel)) {
        nextViewModel.initializeViewModel();
      }

      // now sub to the view model observables
      this.subscribeToUpdates(nextProps, nextState);

      if (isViewModelLifecycle(nextViewModel)) {
        // finally inform the view model it has been (re-)loaded
        nextViewModel.loadedViewModel();
      }
    }

    this.logger.debug('re-rendering');
  }

  componentDidUpdate(prevProps: Readonly<TViewProps>, prevState: Readonly<ViewModelState<TViewModel>>, prevContext: any) {
    this.updatedView(prevProps, prevState);
  }

  componentWillUnmount() {
    this.cleanupView();

    this.unsubscribe();
  }
  // -----------------------------------------

  // -----------------------------------------
  // these are internal lifecycle functions
  // -----------------------------------------
  private initializeView() {
    if (isViewModelLifecycle(this.viewModel)) {
      this.viewModel.initializeViewModel();
    }

    this.initialize();
  }

  private loadedView() {
    this.loaded();

    if (isViewModelLifecycle(this.viewModel)) {
      this.viewModel.loadedViewModel();
    }
  }

  private updatingView(nextProps: Readonly<TViewProps>, nextState: Readonly<ViewModelState<TViewModel>>) {
    this.updating(nextProps, nextState);
  }

  private updatedView(prevProps: Readonly<TViewProps>, prevState: Readonly<ViewModelState<TViewModel>>) {
    this.updated(prevProps, prevState);
  }

  private cleanupView() {
    this.cleanup();

    if (isViewModelLifecycle(this.viewModel)) {
      this.viewModel.cleanupViewModel();
    }
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

  protected updating(nextProps: Readonly<TViewProps>, nextState: Readonly<ViewModelState<TViewModel>>) {
    // do nothing by default
  }

  protected updated(prevProps: Readonly<TViewProps>, prevState: Readonly<ViewModelState<TViewModel>>) {
    // do nothing by default
  }

  protected cleanup() {
    // do nothing by default
  }
  // -----------------------------------------

  protected subscribeToUpdates(props: Readonly<TViewProps>, state: Readonly<ViewModelState<TViewModel>>) {
    const viewModel = this.getViewModelFromState(state);
    const updateProps = this.updateOn(viewModel)
      .asIterable()
      .concat([ viewModel.stateChanged.results ])
      .toArray();

    this.updateSubscription = Observable
      .merge(...updateProps)
      .debounceTime(this.getRateLimit())
      .subscribe(
        () => {
          this.renderView();
        }, x => {
          this.alertForError(x);
        },
      );
  }

  // -----------------------------------------
  // these overridable view functions
  // -----------------------------------------
  protected updateOn(viewModel: Readonly<TViewModel>): Array<Observable<any>> { return []; }

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
  protected bindObservableToCommand<TInput, TResult>(
    observable: Observable<TInput>,
    commandSelector: (viewModel: Readonly<TViewModel>) => Command<TResult>,
    onNext?: (value: TInput) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ) {
    return bindObservableToCommand(this.viewModel, observable, commandSelector, onNext, onError, onCompleted);
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  protected bindEventToProperty<TValue, TEvent extends Event | React.SyntheticEvent<this>>(
    targetSelector: (viewModel: Readonly<TViewModel>) => Property<TValue>,
    valueSelector?: (eventKey: any, event: TEvent) => TValue,
  ) {
    return bindEventToProperty(this.viewModel, targetSelector, valueSelector);
  }

  /**
   * Binds a DOM event to an observable command on the view model
   */
  protected bindEventToCommand<TParameter, TCommand, TEvent extends Event | React.SyntheticEvent<this>>(
    commandSelector: (viewModel: Readonly<TViewModel>) => Command<TCommand>,
    paramSelector?: (eventKey: any, event: TEvent) => TParameter,
    conditionSelector?: (event: TEvent, eventKey: any) => boolean,
    onNext?: (value: TCommand) => void,
    onError?: (exception: any) => void,
    onCompleted?: () => void,
  ) {
    return bindEventToCommand(this.viewModel, commandSelector, paramSelector, conditionSelector, onNext, onError, onCompleted);
  }
  // -----------------------------------------

  protected createStateFromProps(props: Readonly<TViewProps>): Readonly<ViewModelState<TViewModel>> {
    return {
      viewModel: props.viewModel,
    };
  }

  protected getViewModelFromState(state: Readonly<ViewModelState<TViewModel>>): Readonly<TViewModel> {
    return state.viewModel;
  }

  protected addSubscription<T extends TeardownLogic>(subscription: T) {
    return this.getSubscriptions().addSubscription(subscription);
  }

  protected addSubscriptions<T extends TeardownLogic>(...subscriptions: T[]) {
    return this.getSubscriptions().addSubscriptions(...subscriptions);
  }

  public unsubscribe() {
    this.updateSubscription = Subscription.unsubscribe(this.updateSubscription);
    this.subscriptions = Subscription.unsubscribe(this.subscriptions);
  }

  // -----------------------------------------
  // this is the property destruction helper
  // this functions will remove key, ref, and viewModel props automatically
  // -----------------------------------------

  public restProps<T>(propsCreator?: (x: TViewProps) => T, ...omits: string[]) {
    return super.restProps(propsCreator, ...omits.concat('viewModel'));
  }
  // -----------------------------------------
}
