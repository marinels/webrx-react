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
  public bindObservable<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Rx.Observable<TResult>) {
    return this.state.bind(observable, commandSelector(this.state));
  }

  /**
   * Binds a DOM event to an observable property on the view model
   */
  public bindCallback<TEvent, TParameter>(
    targetSelector: (viewModel: TViewModel) => wx.IObservableProperty<TParameter>,
    paramSelector: (event: TEvent, ...args: any[]) => TParameter): (event: TEvent) => void {
    return (event: TEvent, ...args: any[]) => targetSelector(this.state)(paramSelector(event, args));
  }

  /**
   * Binds a DOM event to an observable command on the view model
   */
  public bindEvent<TEvent, TParameter>(
    commandSelector: (viewModel: TViewModel) => wx.ICommand<any>,
    eventArgsSelector?: (e: TEvent, args: any[]) => TParameter,
    conditionSelector?: (e: TEvent, x: TParameter) => boolean): (event: TEvent) => void {
    return (e: TEvent, ...args: any[]) => {
      let parameter = eventArgsSelector ? eventArgsSelector(e, args) : null;
      if (conditionSelector == null || conditionSelector(e, parameter) === true) {
        let cmd = commandSelector(this.state);
        if (cmd.canExecute(parameter)) {
          cmd.execute(parameter);
        }
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
