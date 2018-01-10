import * as React from 'react';
import { Icon, IconSize } from 'react-fa';
import { ButtonProps } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';

export interface NavButtonProps extends CommandButtonProps {
  iconSize?: IconSize;
  iconName?: string;
  componentProps?: any;
  compact?: boolean;
}

export interface NavButtonComponentProps extends ButtonProps, NavButtonProps {
}

export class NavButton extends React.Component<NavButtonComponentProps> {
  public static displayName = 'NavButton';

  static defaultProps: Partial<NavButtonProps> = {
    bsStyle: 'link',
    iconSize: 'lg',
    iconName: 'chevron-right',
  };

  render() {
    const { compact, componentProps } = this.props;

    if (compact) {
      return (
        <div className={ this.wxr.classNames('NavButton', 'NavButton-compact') } { ...componentProps }>
          { this.renderButton() }
        </div>
      );
    }

    return (
      <div className={ this.wxr.classNames('NavButton', 'NavButton-container') } { ...componentProps }>
        { this.renderContent() }
        { this.renderButton() }
      </div>
    );
  }

  protected renderContent() {
    return (
      <div className='NavButton-content'>
        { this.props.children }
      </div>
    );
  }

  protected renderButton() {
    const { className, props, rest } = this.restProps(x => {
      const { iconSize, iconName, componentProps, compact } = x;
      return { iconSize, iconName, componentProps, compact };
    });

    return (
      <CommandButton { ...rest } className={ className }>
        <Icon name={ props.iconName! } size={ props.iconSize } fixedWidth />
      </CommandButton>
    );
  }
}
