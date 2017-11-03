import * as React from 'react';
import { Observable, Subscription } from 'rxjs';

import { ObservableLike, ReadOnlyProperty } from '../../../WebRx';

export interface ObservableWrapperProps {
  observable: ObservableLike<any>;
  render?: (x: any) => any;
}

export interface ObservableWrapperComponentProps extends ObservableWrapperProps {
}

export interface ObservableWrapperState {
  value: any;
}

export class ObservableWrapper extends React.Component<ObservableWrapperComponentProps, ObservableWrapperState> {
  private static defaultProps = {
    render: (x: any) => x,
  };

  private property: ReadOnlyProperty<any>;
  private subscription: Subscription;

  componentWillMount() {
    this.property = this.wx.getObservable(this.props.observable)
      .toProperty();
    this.subscription = this.wx
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
