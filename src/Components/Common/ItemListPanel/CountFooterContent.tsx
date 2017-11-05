import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { Badge } from 'react-bootstrap';

export interface CountFooterContentProps extends React.HTMLAttributes<CountFooterContent> {
  length: Observable<number>;
  suffix?: string;
}

export interface CountFooterState {
  length: number;
}

export class CountFooterContent extends React.Component<CountFooterContentProps, CountFooterState> {
  public static displayName = 'CountFooterContent';

  static defaultProps = {
    suffix: 'Items',
  };

  private lengthChangedSub: Subscription;

  constructor(props?: CountFooterContentProps, context?: any) {
    super(props, context);

    this.lengthChangedSub = Subscription.EMPTY;

    this.state = {
      length: 0,
    };
  }

  componentDidMount() {
    this.lengthChangedSub = this.props.length
      .subscribe(x => {
        this.setState({
          length: x || 0,
        });
      });
  }

  componentWillUnmount() {
    this.lengthChangedSub = Subscription.unsubscribe(this.lengthChangedSub);
  }

  render() {
    return (
      <div className='CountFooterContent'>
        <Badge>{ this.state.length || 0 }</Badge>
        {
          this.wxr.renderConditional(String.isNullOrEmpty(this.props.suffix) === false, () => (
            <span className='CountFooterContent-suffix'>{ this.props.suffix }</span>
          ))
        }
      </div>
    );
  }
}
