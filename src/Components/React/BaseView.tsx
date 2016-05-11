'use strict';

import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';

import { getLogger } from '../../Utils/Logging/LogManager';
import { IBaseViewModel } from './BaseViewModel';

export interface IBaseViewProps extends React.HTMLAttributes {
  viewModel: IBaseViewModel;
}

export abstract class BaseView<TViewProps extends IBaseViewProps, TViewModel extends IBaseViewModel> extends React.Component<TViewProps, TViewModel> {
  public static displayName = 'BaseView';

  private updateSubscription: Rx.IDisposable;

  protected logger = getLogger(this.getDisplayName());

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.state = props.viewModel as TViewModel;
  }

  protected updateOn(): Rx.Observable<any>[] { return []; }

  protected getDisplayName() { return Object.getName(this); }
  protected getRateLimit() { return 100; }

  protected renderView() { this.forceUpdate(); }

  protected initialize() {
    // do nothing by default
  }

  protected loaded() {
    // do nothing by default
  }

  protected cleanup() {
    // do nothing by default
  }

  /**
   * Binds an observable to a command on the view model
   */
  public bindObservableToCommand<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Rx.Observable<TResult>) {
    return this.state.bind(observable, commandSelector(this.state));
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  public bindEventToProperty<TValue, TEvent>(
    targetSelector: (viewModel: TViewModel) => wx.IObservableProperty<TValue>,
    valueSelector?: (eventKey: any, event: TEvent) => TValue) {
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
  public bindEventToCommand<TParameter, TEvent>(
    commandSelector: (viewModel: TViewModel) => wx.ICommand<any>,
    paramSelector?: (eventKey: any, event: TEvent) => TParameter,
    conditionSelector?: (event: TEvent, eventKey: any) => boolean) {
    return (eventKey: any, event: TEvent) => {
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

  componentWillMount() {
    this.state.initialize();
    this.initialize();

    this.subscribeToUpdates();

    this.logRender(true);
  }

  componentDidMount() {
    this.state.loaded();
    this.loaded();
  }

  componentWillReceiveProps(nextProps: TViewProps, nextContext: any) {
    let state = nextProps.viewModel;

    if (state !== this.state) {
      this.logger.debug('ViewModel Change Detected');

      // cleanup old view model
      this.state.cleanup();
      this.updateSubscription = Object.dispose(this.updateSubscription);

      // set our new view model as the current state and initialize it
      this.state = state as TViewModel;
      this.state.initialize();
      this.subscribeToUpdates();

      this.forceUpdate();
    }
  }

  componentWillUpdate(nextProps: TViewProps, nextState: TViewModel, nextContext: any) {
    this.logRender(false);
  }

  componentWillUnmount() {
    this.cleanup();
    this.state.cleanup();

    this.updateSubscription = Object.dispose(this.updateSubscription);
  }
}

export default BaseView;
