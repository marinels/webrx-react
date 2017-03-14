import * as React from 'react';
import { Observable, IDisposable } from 'rx';
import { Badge } from 'react-bootstrap';

import { renderConditional } from '../../React/RenderHelpers';

import './CountFooterContent.less';

export interface CountFooterContentProps extends React.HTMLAttributes<CountFooterContent> {
  length: Observable<number>;
  suffix?: string;
}

interface CountFooterState {
  length: number;
}

export class CountFooterContent extends React.Component<CountFooterContentProps, CountFooterState> {
  public static displayName = 'CountFooterContent';

  static defaultProps = {
    suffix: 'Items',
  };

  private lengthChangedSub: IDisposable | undefined;

  constructor(props?: CountFooterContentProps, context?: any) {
    super(props, context);

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
    this.lengthChangedSub = Object.dispose(this.lengthChangedSub);
  }

  render() {
    return (
      <div className='CountFooterContent'>
        <Badge>{ this.state.length || 0 }</Badge>
        {
          renderConditional(String.isNullOrEmpty(this.props.suffix) === false, () => (
            <span className='CountFooterContent-suffix'>{ this.props.suffix }</span>
          ))
        }
      </div>
    );
  }
}
