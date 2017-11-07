import * as React from 'react';
import { Icon, IconSize } from 'react-fa';
import { ButtonProps } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';

export interface NavButtonProps extends CommandButtonProps {
  iconSize?: IconSize;
  iconName?: string;
  componentProps?: any;
}

export interface NavButtonComponentProps extends ButtonProps, NavButtonProps {
}

export class NavButton extends React.Component<NavButtonComponentProps> {
  public static displayName = 'NavButton';

  static defaultProps = {
    bsStyle: 'link',
    iconSize: 'lg',
    iconName: 'chevron-right',
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { iconSize, iconName, componentProps } = x;
      return { iconSize, iconName, componentProps };
    });

    return (
      <div className='NavButton' { ...props.componentProps }>
        <div className='NavButton-contentContainer'>
          {
            this.wxr.renderNullable(
              children,
              x => (
                <div className='NavButton-content'>
                  { children }
                </div>
              ),
            )
          }
        </div>
        <CommandButton { ...rest } className={ className }>
          <Icon name={ props.iconName! } size={ props.iconSize } fixedWidth />
        </CommandButton>
      </div>
    );
  }
}
