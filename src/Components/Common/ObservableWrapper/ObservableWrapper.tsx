import * as React from 'react';
import { Observable, IDisposable } from 'rx';

import { wx, ObservableOrProperty, ReadOnlyProperty } from '../../../WebRx';

export interface ObservableWrapperProps {
  observableOrProperty: ObservableOrProperty<any>;
  render?: (x: any) => any;
}

export interface ObservableWrapperState {
  value: any;
}

export class ObservableWrapper extends React.Component<ObservableWrapperProps, ObservableWrapperState> {
  private static defaultProps = {
    render: (x: any) => x,
  };

  private property: ReadOnlyProperty<any>;
  private subscription: IDisposable;

  componentWillMount() {
    this.property = wx.getObservable(this.props.observableOrProperty)
      .toProperty();
    this.subscription = wx
      .whenAny(this.property, x => x)
      .subscribe(value => {
        this.setState({
          value,
        });
      });
  }

  componentWillUnmount() {
    this.property = Object.dispose(this.property);
    this.subscription = Object.dispose(this.subscription);
  }

  render() {
    return this.props.render!(this.state.value) || null;
  }
}
