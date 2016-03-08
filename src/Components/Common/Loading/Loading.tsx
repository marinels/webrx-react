'use strict';

import * as Rx from 'rx';
import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { ProgressBar, ProgressBarProps } from 'react-bootstrap';

import './Loading.less';

export interface ILoadingProps extends ProgressBarProps {
  value?: number;
  text?: string;
  animationPeriod?: number;
  animationCycleDelay?: number;
}

export interface ILoadingState {
  value: number;
  text: string;
}

export class Loading extends React.Component<ILoadingProps, ILoadingState> {
  public static displayName = 'Loading';

  static defaultProps = {
    active: true,
    striped: true,
    value: 100,
    text: 'Loading...',
    animationPeriod: 0,
    animationCycleDelay: 2000,
  };

  private animationSubscription: Rx.IDisposable = null;

  constructor(props?: ILoadingProps, context?: any) {
    super(props, context);

    this.state = {
      value: this.props.animationPeriod > 0 ? 0 : this.props.value,
      text: this.props.text,
    };
  }

  componentDidMount() {
    if (this.props.animationPeriod > 0) {
      this.animationSubscription = Rx.Observable
        .timer(this.props.animationPeriod, this.props.animationPeriod)
        .select(x => {
          let val = ++this.state.value;
          if ((val - 100) * this.props.animationPeriod >= this.props.animationCycleDelay) {
            this.state.value = 0;
          }
          return this.state.value;
        })
        .subscribe(x => {
          this.setState(this.state);
        });
    }
  }

  componentWillUnmount() {
    if (this.animationSubscription != null) {
      this.animationSubscription.dispose();

      this.animationSubscription = null;
    }
  }

  render() {
    let props = Object.assign<any>({}, this.props);
    props.isChild = true; // Hack to only render the progress bar and not the container

    let classNames = this.state.value === 0 ? 'progress-bar--static' : null;

    return (
      <div className='Loading'>
        <ProgressBar className={classNames} now={Math.min(100, this.state.value)} {...props} />
        <div className='Loading-text'>{this.state.text}</div>
      </div>
    );
  }
}

export default Loading;
