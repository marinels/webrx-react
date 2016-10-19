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

export interface ILoadingState {
  value: number;
}

export class Loading extends React.Component<ILoadingProps, ILoadingState> {
  public static displayName = 'Loading';

  static defaultProps = {
    value: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription: Rx.IDisposable;

  constructor(props?: ILoadingProps, context?: any) {
    super(props, context);

    let value = this.props.value as number;
    if (wx.isProperty(this.props.value) === true) {
      value = (this.props.value as wx.IObservableProperty<number>).apply(null) as number;
    }

    this.state = {
      value,
    };
  }

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
        <ProgressBar style={({ fontSize: this.props.fontSize })} active now={ this.state.value } label={ this.props.text } />
      </Component>
    );
  }
}
