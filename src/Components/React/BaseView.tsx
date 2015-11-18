'use strict';

import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';

import logManager from '../App/Logging';
import { IBaseViewModel } from './BaseViewModel';

export interface IBaseViewProps {
  viewModel: IBaseViewModel;
}

export abstract class BaseView<TViewProps extends IBaseViewProps, TViewModel extends IBaseViewModel> extends React.Component<TViewProps, TViewModel> {
  public static displayName = 'BaseView';

  private updateSubscription: Rx.IDisposable;

  protected logger = logManager.getLogger(this.getDisplayName());

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.state = props.viewModel as TViewModel;
  }

  protected updateOn(): Rx.Observable<any>[] { return []; }

  protected getDisplayName() { return Object.getName(this); }
  protected getRateLimit() { return 100; }

  protected initialize() {}
  protected cleanup() {}

  protected bindText(propertySelector: (viewModel: TViewModel) => wx.IObservableProperty<string>) {
    return (x: any) => {
      let value = (x.target as React.HTMLAttributes).value;
      propertySelector(this.state)(value);
      this.forceUpdate();
    }
  }

  protected bindObservable<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Rx.Observable<TResult>) {
    return this.state.bind(observable, commandSelector(this.state));
  }

  protected bindCallback<TParameter>(
    targetSelector: (viewModel: TViewModel) => wx.IObservableProperty<TParameter>,
    paramSelector: (...args: any[]) => TParameter
  ) : (args: any[]) => void {
    return (...args: any[]) => targetSelector(this.state)(paramSelector(args));
  }

  protected bindEvent<TEvent, TParameter>(
    commandSelector: (viewModel: TViewModel) => wx.ICommand<any>,
    conditionSelector?: (e: TEvent, x: TParameter) => boolean,
    eventArgsSelector?: (e: TEvent, args: any[]) => TParameter
  ): (event: TEvent) => void {
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
    this.logger.debug('{0}rendering', initial ? '' : 're-');
  }

  componentWillMount() {
    this.state.initialize();
    this.initialize();

    let updateProps = this.updateOn();
    updateProps.push(this.state.stateChanged.results);

    this.updateSubscription = Rx.Observable
      .fromArray(updateProps)
      .selectMany(x => x)
      .debounce(this.getRateLimit())
      .subscribe(x => {
        this.forceUpdate();
      });

    this.logRender(true);
  }

  componentWillUpdate(nextProps: TViewProps, nextState: TViewModel, nextContext: any) {
    this.logRender(false);
  }

  componentWillUnmount() {
    this.cleanup();
    this.props.viewModel.cleanup();

    this.updateSubscription = Object.dispose(this.updateSubscription);
  }
}

export default BaseView;
