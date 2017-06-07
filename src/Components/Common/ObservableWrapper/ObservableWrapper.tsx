import * as React from 'react';
import { Observable, Subscription } from 'rxjs';

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
  private subscription: Subscription;

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
    this.property = Subscription.unsubscribe(this.property);
    this.subscription = Subscription.unsubscribe(this.subscription);
  }

  render() {
    return this.props.render!(this.state.value) || null;
  }
}
