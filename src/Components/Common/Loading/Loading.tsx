import * as React from 'react';
import { Subscription } from  'rxjs';
import { ProgressBar } from 'react-bootstrap';

import { Property } from '../../../WebRx';

export interface LoadingProps {
  progress?: Property<number> | number;
  text?: string;
  fontSize?: number | string;
  componentClass?: any;
}

export interface LoadingComponentProps extends React.HTMLProps<any>, LoadingProps {
}

export class Loading extends React.Component<LoadingComponentProps> {
  public static displayName = 'Loading';

  static defaultProps = {
    progress: 100,
    text: 'Loading...',
    componentClass: 'div',
  };

  private changedSubscription = Subscription.EMPTY;

  componentDidMount() {
    if (this.wx.isProperty(this.props.progress) === true) {
      this.changedSubscription = (this.props.progress as Property<number>).changed
        .subscribe(() => { this.forceUpdate(); });
    }
  }

  componentWillUnmount() {
    this.changedSubscription = Subscription.unsubscribe(this.changedSubscription);
  }

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { progress, text, fontSize, componentClass } = x;
      return { progress, text, fontSize, componentClass };
    });

    const Component = props.componentClass;

    return (
      <Component { ...rest } className={ this.wxr.classNames('Loading', className) }>
        <ProgressBar style={({ fontSize: props.fontSize })} active now={ this.getProgressValue() } label={ props.text }>
          { children }
        </ProgressBar>
      </Component>
    );
  }

  private getProgressValue() {
    return this.wx.isProperty(this.props.progress) === true ?
      (this.props.progress as Property<number>).value :
      this.props.progress as number;
  }
}
