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

  protected updateOn(): Rx.Observable<any>[] { return []; }

  protected getDisplayName() { return Object.getName(this); }
  protected getRateLimit() { return 100; }

  protected initialize() {}
  protected cleanup() {}

  protected bindText(propertySelector: (viewModel: TViewModel) => wx.IObservableProperty<string>) {
    return (x: any) => {
      let value = (x.target as React.HTMLAttributes).value;
      propertySelector(this.state)(value);
    }
  }

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

    let updateProps = this.updateOn();

    if (updateProps.length > 0) {
      this.updateSubscription = Rx.Observable
        .fromArray(updateProps)
        .selectMany(x => x)
        .debounce(this.getRateLimit())
        .subscribe(x => {
          this.forceUpdate();
        });
    }
  }

  componentWillUpdate() {
    if (BaseView.EnableViewRenderDebugging) {
      console.log(String.format('rendering [{0}]...', this.getDisplayName()));
    }
  }

  componentWillUnmount() {
    this.cleanup();
    this.props.viewModel.cleanup();

    this.updateSubscription = Object.dispose(this.updateSubscription);
  }
}

export default BaseView;
