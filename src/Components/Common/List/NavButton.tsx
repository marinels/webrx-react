import * as React from 'react';
import { Icon, IconSize } from 'react-fa';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';

export interface NavButtonProps extends CommandButtonProps {
  iconSize?: IconSize;
}

export class NavButton extends React.Component<NavButtonProps> {
  public static displayName = 'NavButton';

  static defaultProps = {
    bsStyle: 'link',
    iconSize: 'lg',
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { iconSize } = x;
      return { iconSize };
    });

    return (
      <CommandButton { ...rest } className={ wxr.classNames('NavButton', className) }>
        <Icon name='chevron-right' size={ props.iconSize } />
      </CommandButton>
    );
  }
}
