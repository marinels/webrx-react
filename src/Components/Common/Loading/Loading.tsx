import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';

import { ProgressBar } from 'react-bootstrap';

import './Loading.less';

export interface ILoadingProps {
  value?: wx.IObservableProperty<number> | number;
  text?: string;
  fontSize?: number | string;
  componentClass?: any;
}

export class Loading extends React.Component<LoadingProps, any> {
  public static displayName = 'Loading';

  static defaultProps = {
    value: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription: Rx.IDisposable;

  componentDidMount() {
    if (wx.isProperty(this.props.value) === true) {
      this.changedSubscription = (this.props.value as wx.IObservableProperty<number>).changed
        .subscribe(x => { this.forceUpdate(); });
    }
  }

  componentWillUnmount() {
    this.changedSubscription = Object.dispose(this.changedSubscription);
  }

  render() {
    const Component = this.props.componentClass;

    return (
      <Component className='Loading'>
        <ProgressBar style={({ fontSize: this.props.fontSize })} active now={ this.getProgressValue() } label={ this.props.text } />
      </Component>
    );
  }

  private getProgressValue() {
    return wx.isProperty(this.props.value) === true ?
      (this.props.value as wx.IObservableProperty<number>).apply(null) as number :
      this.props.value as number;
  }
}
