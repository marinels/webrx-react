import * as React from 'react';
import { Observable, IDisposable } from 'rx';
import * as wx from 'webrx';

export interface ObservableWrapperProps {
  observableOrProperty: wx.ObservableOrProperty<any>;
  render: (x: any) => any;
}

interface ObservableWrapperState {
  property: wx.IObservableReadOnlyProperty<any>;
  sub: IDisposable;
}

export class ObservableWrapper extends React.Component<ObservableWrapperProps, ObservableWrapperState> {
  private createProperty() {
    return wx.isProperty(this.props.observableOrProperty) ?
      this.props.observableOrProperty as wx.IObservableReadOnlyProperty<any> :
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
    return this.props.render(this.state.property());
  }
}
