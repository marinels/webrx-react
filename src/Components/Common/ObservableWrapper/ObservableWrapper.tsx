import * as React from 'react';
import { Observable, IDisposable } from 'rx';

import { wx, ObservableOrProperty, ReadOnlyProperty } from '../../../WebRx';

export interface ObservableWrapperProps {
  observableOrProperty: ObservableOrProperty<any>;
  render: (x: any) => any;
}

export interface ObservableWrapperState {
  property: ReadOnlyProperty<any>;
  sub: IDisposable;
}

export class ObservableWrapper extends React.Component<ObservableWrapperProps, ObservableWrapperState> {
  private createProperty() {
    return wx.isProperty(this.props.observableOrProperty) ?
      this.props.observableOrProperty as ReadOnlyProperty<any> :
      (this.props.observableOrProperty as Observable<any>).toProperty();
  }

  componentWillMount() {
    const property = this.createProperty();
    this.state = {
      property,
      sub: property.changed
        .subscribe(() => {
          this.forceUpdate();
        }),
    };
  }

  componentWillUnmount() {
    Object.dispose(this.state.property);
    Object.dispose(this.state.sub);
  }

  render() {
    return this.props.render(this.state.property.value);
  }
}
