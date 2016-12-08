import * as React from 'react';
import * as classNames from 'classnames';
import { Icon, IconSize } from 'react-fa';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';

import './NavButton.less';

export interface NavButtonProps extends CommandButtonProps {
  iconSize?: IconSize;
}

export class NavButton extends React.Component<NavButtonProps, any> {
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
      <CommandButton { ...rest } className={ classNames('NavButton', className) }>
        <Icon name='chevron-right' size={ props.iconSize } />
      </CommandButton>
    );
  }
}
