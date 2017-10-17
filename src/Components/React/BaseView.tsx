import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { AnonymousSubscription, TeardownLogic } from 'rxjs/Subscription';

import { Property, Command } from '../../WebRx';
import { ReactSpreadResult } from '../../Extensions/React';
import { Alert, Logging } from '../../Utils';
import { BaseViewModel, ViewModelLifecyle, isViewModelLifecycle } from './BaseViewModel';
import { renderIterable, renderConditional, renderNullable, renderLoadable, renderSizedLoadable, renderGridLoadable, focusElement, classNames } from './RenderHelpers';
import { bindObservableToCommand, bindEventToProperty, bindEventToCommand } from './BindingHelpers';

export interface ViewModelProps<T extends BaseViewModel = BaseViewModel> {
  viewModel: T;
}

export interface BaseViewProps<TViewModel extends BaseViewModel = BaseViewModel, TView extends BaseView<any, any> = any> extends ViewModelProps<TViewModel>, React.HTMLProps<TView> {
}

export abstract class BaseView<TViewProps extends ViewModelProps<any>, TViewModel extends BaseViewModel> extends React.Component<TViewProps, TViewModel> implements AnonymousSubscription {
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
    return this.state;
  }

  private getSubscriptions() {
    if (this.subscriptions === Subscription.EMPTY) {
      this.subscriptions = new Subscription();
    }

    return this.subscriptions;
  }

  private replaceViewModel() {
    // WARN: horrible hack ahead
    // we cannot just call this.setState(...)
    // it will end up shallow merging our new state
    // this results in a shallow clone of our view model (not the view model instance passed in)

    type ReactFiberClassComponent = {
      updater: {
        enqueueReplaceState: (
          component: React.Component<TViewProps, TViewModel>,
          partialState: (prevState: TViewModel, props: TViewProps) => TViewModel,
        ) => void;
      };
    };

    function isReactFiberClassComponent(component: any): component is ReactFiberClassComponent {
      const fiberComponent: ReactFiberClassComponent = component;

      return (
        fiberComponent != null &&
        fiberComponent.updater != null &&
        fiberComponent.updater.enqueueReplaceState instanceof Function
      );
    }

    if (isReactFiberClassComponent(this)) {
      // queue a replacement of state (which does not perform a shallow merge)
      this.updater.enqueueReplaceState(
        this,
        (prevState, props) => {
          return this.createStateFromProps(props);
        },
      );
    }
    else {
      this.logger.error('Unable to perform view model replacement: invalid React Fiber Updater');
    }
  }

  // -----------------------------------------
  // these are react lifecycle functions
  // -----------------------------------------
  componentWillMount() {
    this.initializeView();

    this.subscribeToUpdates();

    this.logger.debug('rendering');
  }

  componentDidMount() {
    this.loadedView();
  }

  componentWillReceiveProps(nextProps: TViewProps, nextContext: any) {
    // if the view model changed we need to do some teardown and setup
    if (nextProps.viewModel !== this.viewModel) {
      this.logger.info('ViewModel Change Detected');

      // unsubscribe from updates
      this.updateSubscription = Subscription.unsubscribe(this.updateSubscription);

      // cleanup old view model
      if (isViewModelLifecycle(this.viewModel)) {
        this.viewModel.cleanupViewModel();
      }

      // ask react to generate new state from the updated props
      this.replaceViewModel();
    }
  }

  componentWillUpdate(nextProps: TViewProps, nextState: TViewModel, nextContext: any) {
    this.updatingView(nextProps);

    // check if we need to re-subscripe to updates (if our view model changed)
    if (this.updateSubscription === Subscription.EMPTY) {
      if (isViewModelLifecycle(this.viewModel)) {
        // first initialize the view model
        this.viewModel.initializeViewModel();
      }

      // now sub to the view model observables
      this.subscribeToUpdates();

      if (isViewModelLifecycle(this.viewModel)) {
        // finally inform the view model it has been (re-)loaded
        this.viewModel.loadedViewModel();
      }
    }

    this.logger.debug('re-rendering');
  }

  componentDidUpdate(prevProps: TViewProps, prevState: TViewModel, prevContext: any) {
    this.updatedView(prevProps);
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

  private updatingView(nextProps: TViewProps) {
    this.updating(nextProps);
  }

  private updatedView(prevProps: TViewProps) {
    this.updated(prevProps);
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

  protected subscribeToUpdates() {
    const updateProps = this.updateOn();

    updateProps.push(this.viewModel.stateChanged.results);

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

  protected createStateFromProps(props: TViewProps) {
    return props.viewModel;
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
