import * as Rx from 'rx';
import * as React from 'react';
import { Grid, Row } from 'react-bootstrap';

import { SubMan } from '../../../Utils/SubMan';

import './Loading.less';

export interface ILoadingProps {
  value?: number;
  text?: string;
  indeterminate?: boolean;
  fluid?: boolean;
  fontSize?: number;
}

export interface ILoadingState {
  width: number;
  left: number;
}

const IndeterminateWidth = 10;
const IndeterminateAnimationPeriod = 50;

export class Loading extends React.Component<ILoadingProps, ILoadingState> {
  public static displayName = 'Loading';

  static defaultProps = {
    value: 100,
    text: 'Loading...',
    indeterminate: false,
    fluid: false,
    fontSize: 50,
  };

  private subs = new SubMan();

  constructor(props?: ILoadingProps, context?: any) {
    super(props, context);

    this.state = {
      width: this.props.indeterminate === true ? IndeterminateWidth : this.props.value,
      left: this.props.indeterminate === true ? -IndeterminateWidth : 0,
    };
  }

  componentDidMount() {
    if (this.props.indeterminate === true) {
      this.subs.add(Rx.Observable
        .timer(IndeterminateAnimationPeriod, IndeterminateAnimationPeriod)
        .subscribe(x => {
          if (++this.state.left > 100) {
            this.state.left = -IndeterminateWidth;
          }

          this.forceUpdate();
        })
      );
    }
  }

  componentWillUnmount() {
    this.subs.dispose();
  }

  render() {
    return (
      <div className='Loading' style={({fontSize: this.props.fontSize, lineHeight: `${this.props.fontSize * 1.35}px`})}>
        <Grid fluid={this.props.fluid}>
          <Row>
            <div className='Loading-wrapper' style={({height: `${this.props.fontSize * 1.4}px`})}>
              <div
                className='Loading-progress progress-bar progress-bar-striped active'
                role='progressbar'
                aria-valuemin={0} aria-valuemax={100}
                style={({
                  width: `${this.state.width}%`,
                  left: `${this.state.left}%`,
                  transition: this.state.left === -IndeterminateWidth ? 'none' : null,
                })}
              />
              <div className='Loading-textContainer'>
                <span className='Loading-text'>
                  {this.props.text}
                </span>
              </div>
            </div>
          </Row>
        </Grid>
      </div>
    );
  }
}
