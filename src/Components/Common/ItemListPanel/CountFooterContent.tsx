import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { Badge } from 'react-bootstrap';

import { ObservableLike } from '../../../WebRx';

export interface CountFooterContentProps {
  count: ObservableLike<number>;
  suffix?: string;
}

export interface CountFooterContentComponentProps extends CountFooterContentProps, React.HTMLProps<CountFooterContent> {
}

export interface CountFooterState {
  count: number;
}

export class CountFooterContent extends React.Component<CountFooterContentComponentProps, CountFooterState> {
  public static displayName = 'CountFooterContent';

  private countChangedSub = Subscription.EMPTY;

  componentDidMount() {
    this.countChangedSub = this.wx
      .whenAny(
        this.props.count,
        x => x,
      )
      .subscribe(x => {
        this.setState({
          count: x || 0,
        });
      });
  }

  componentWillUnmount() {
    this.countChangedSub = Subscription.unsubscribe(this.countChangedSub);
  }

  render() {
    const count = this.state == null ? 0 : this.state.count || 0;

    return (
      <div className='CountFooterContent'>
        <Badge>{ count }</Badge>
        {
          this.wxr.renderConditional(
            String.isNullOrEmpty(this.props.suffix) === false,
            () => (
              <span className='CountFooterContent-suffix'>{ this.props.suffix }</span>
            ),
          )
        }
      </div>
    );
  }
}
