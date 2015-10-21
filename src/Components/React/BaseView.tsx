'use strict';

import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';

import { IBaseViewModel } from './BaseViewModel';

export interface IBaseViewProps {
  viewModel: IBaseViewModel;
}

export abstract class BaseView<TViewProps extends IBaseViewProps, TViewModel extends IBaseViewModel> extends React.Component<TViewProps, TViewModel> {
  private updateSubscription: Rx.IDisposable;

  public static EnableViewRenderDebugging = false;

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.state = props.viewModel as TViewModel;
  }

  protected abstract updateFor(): Rx.Observable<any>[];

  protected getDisplayName() { return Object.getName(this); }

  protected initialize() {}
  protected cleanup() {}

  protected bindObservable<TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, observable: Rx.Observable<TResult>) {
    return this.state.bind(observable, commandSelector(this.state));
  }

  protected bindEvent<TEvent extends React.SyntheticEvent, TResult>(commandSelector: (viewModel: TViewModel) => wx.ICommand<TResult>, eventArgsSelector?: (e: TEvent, ...args: any[]) => TResult): React.EventHandler<TEvent> {
    return (e: TEvent, ...args: any[]) => {
      commandSelector(this.state).execute(eventArgsSelector ? eventArgsSelector(e, args) : null);
    };
  }

  componentWillMount() {
    this.state.initialize();
    this.initialize();

    this.updateSubscription = Rx.Observable
      .fromArray(this.updateFor())
      .selectMany(x => x)
      .debounce(100)
      .subscribe(x => {
        this.forceUpdate();
      });
  }

  componentWillUpdate() {
    if (BaseView.EnableViewRenderDebugging) {
      console.log(String.format('rendering [{0}]...', this.getDisplayName()));
    }
  }

  componentWillUnmount() {
    this.cleanup();
    this.props.viewModel.cleanup();

    this.updateSubscription.dispose();
  }
}

export default BaseView;
