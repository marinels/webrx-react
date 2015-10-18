'use strict';

import * as React from 'react';
import * as wx from 'webrx';
import * as Rx from 'rx';

import { IBaseViewModel } from './BaseViewModel';

export const EnableViewDebugging = false;

export interface IBaseViewProps {
  viewModel: IBaseViewModel;
}

export abstract class BaseView<TViewProps extends IBaseViewProps, TViewModel extends IBaseViewModel> extends React.Component<TViewProps, TViewModel> {
  private updateSubscription: Rx.IDisposable;

  constructor(props?: TViewProps, context?: any) {
    super(props, context);

    this.state = props.viewModel as TViewModel;
  }

  protected abstract getUpdateProperties(): wx.IObservableProperty<any>[];

  protected initialize() {}
  protected cleanup() {}

  componentWillMount() {
    this.state.initialize();
    this.initialize();

    this.updateSubscription = Rx.Observable
      .fromArray(this.getUpdateProperties())
      .selectMany(x => x.changed)
      .debounce(100)
      .subscribe(x => {
        if (EnableViewDebugging) {
          console.log('rendering...');
        }

        this.forceUpdate();
      });
  }

  componentWillUnmount() {
    this.cleanup();
    this.props.viewModel.cleanup();

    this.updateSubscription.dispose();
  }
}

export default BaseView;
