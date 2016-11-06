import * as React from 'react';
import * as classNames from 'classnames';
import { IDisposable } from  'rx';
import * as wx from 'webrx';
import { ProgressBar } from 'react-bootstrap';

import './Loading.less';

export interface LoadingProps extends React.HTMLAttributes {
  progress?: wx.IObservableProperty<number> | number;
  text?: string;
  fontSize?: number | string;
  componentClass?: any;
}

export class Loading extends React.Component<LoadingProps, any> {
  public static displayName = 'Loading';

  static defaultProps = {
    progress: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription: IDisposable;

  componentDidMount() {
    if (wx.isProperty(this.props.progress) === true) {
      this.changedSubscription = (this.props.progress as wx.IObservableProperty<number>).changed
        .subscribe(x => { this.forceUpdate(); });
    }
  }

  componentWillUnmount() {
    this.changedSubscription = Object.dispose(this.changedSubscription);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { progress, text, fontSize, componentClass } = x;
      return { progress, text, fontSize, componentClass };
    });

    const Component = props.componentClass;

    return (
      <Component { ...rest } className={ classNames('Loading', className) }>
        <ProgressBar style={({ fontSize: props.fontSize })} active now={ this.getProgressValue() } label={ props.text }>
          { children }
        </ProgressBar>
      </Component>
    );
  }

  private getProgressValue() {
    return wx.isProperty(this.props.progress) === true ?
      (this.props.progress as wx.IObservableProperty<number>).apply(null) as number :
      this.props.progress as number;
  }
}
