import * as React from 'react';
import { Icon } from 'react-fa';

export interface ViewAllFooterActionProps extends React.HTMLAttributes<ViewAllFooterAction> {
  suffix?: string;
}

export class ViewAllFooterAction extends React.Component<ViewAllFooterActionProps> {
  public static displayName = 'ViewAllFooterAction';

  static defaultProps = {
    suffix: '',
  };

  render() {
    return (
      <div className='ViewAllFooterAction'>
        <span>{ `View All${ String.isNullOrEmpty(this.props.suffix) === true ? '' : ` ${ this.props.suffix }` }` }</span>
        <Icon name='caret-right' />
      </div>
    );
  }
}
