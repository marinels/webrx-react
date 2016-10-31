import * as React from 'react';
import { Overlay, Popover, MenuItemProps, PopoverProps } from 'react-bootstrap';

import './ContextMenu.less';

export interface ContextMenuProps {
  key?: string | number;
  id: string;
  header?: string;
  onSelect?: (item: MenuItemProps) => void;
  children?: any;
}

export interface ContextMenuState {
  isVisible: boolean;
  left: number;
  top: number;
}

// this is necessary to prevent a js error due to the Overlay trying to position the Popup
class DummyWrapper extends React.Component<PopoverProps, any> {
  render() {
    return (
      <div className={ this.props.className }>{ this.props.children }</div>
    );
  }
}

export class ContextMenu extends React.Component<ContextMenuProps, ContextMenuState> {
  public static displayName = 'ContextMenu';

  private static ArrowOffset = 20;

  static defaultProps = {
    offsetX: 0,
    offsetY: 0,
  };

  constructor(props?: ContextMenuProps, context?: any) {
    super(props, context);

    this.state = { isVisible: false } as ContextMenuState;
  }

  private handleClick(e: React.MouseEvent) {
    let isVisible = e.button === 2;

    if (isVisible) {
      e.preventDefault();

      this.setState({
        isVisible,
        left: e.pageX,
        top: e.pageY - ContextMenu.ArrowOffset,
      });
    }
  }

  private hide() {
    this.setState({
      isVisible: false,
      left: null,
      top: null,
    });
  }

  render() {
    let menuItems = React.Children.toArray(this.props.children);
    let target = menuItems.shift();

    let menu: any;

    if (this.state.left != null && this.state.top != null) {
      if (this.props.onSelect != null) {
        menuItems = React.Children.map(menuItems, (x: React.ReactElement<any>) => {
          return React.cloneElement(x, { onSelect: () => this.props.onSelect(x.props) });
        });
      }

      menu = (
        <Popover id={this.props.id} placement='right' title={this.props.header}
          arrowOffsetTop={ContextMenu.ArrowOffset}
          positionLeft={this.state.left} positionTop={this.state.top}>
          <ul className='dropdown-menu'>
            {menuItems}
          </ul>
        </Popover>
      );
    }

    return (
      <div className='ContextMenu'>
        <div className='ContextMenu-target' onContextMenu={e => this.handleClick(e)}>
          {target}
        </div>
        <Overlay show={this.state.isVisible} rootClose onHide={() => this.hide()}>
          <DummyWrapper className='ContextMenu-menu'>
            {menu}
          </DummyWrapper>
        </Overlay>
      </div>
    );
  }
}
