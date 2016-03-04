'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Overlay, Popover, ListGroup, ListGroupItem } from 'react-bootstrap';

import * as Icon from 'react-fa';

import './ContextMenu.less';

export class MenuItem {
  public static displayName = 'MenuItem';

  constructor(public content: any, public onSelect?: () => void, public iconName?: any) {
  }

  private handleClick(hide: () => void) {
    if (this.onSelect != null) {
      this.onSelect();
    }

    hide();
  }

  public render(index: number, hide: () => void) {
    return (
      <ListGroupItem className='ContextMenu-item' key={index} disabled={this.onSelect == null} onClick={() => this.handleClick(hide)}>
        <div className='ContextMenu-itemIcon'>
          <Icon name={this.iconName} fixedWidth />
        </div>
        <div className='ContextMenu-itemContent'>
          {this.content}
        </div>
      </ListGroupItem>
    );
  }
}

interface IContextMenuProps {
  key?: string | number;
  id: string;
  header: string;
  items: MenuItem[];
  children?: any;
}

interface IContextMenuState {
  isVisible: boolean;
  left: number;
  top: number;
}

export class ContextMenu extends React.Component<IContextMenuProps, IContextMenuState> {
  public static displayName = 'ContextMenu';

  private static ArrowOffset = 20;

  static defaultProps = {
    offsetX: 0,
    offsetY: 0
  };

  constructor(props?: IContextMenuProps, context?: any) {
    super(props, context);

    this.state = { isVisible: false } as IContextMenuState;
  }

  private renderMenuItems() {
    return this.props.items.map((x, i) => x.render(i, () => this.hide()));
  }

  private renderMenu() {
    let menu: any;

    if (this.state.left != null && this.state.top != null) {
      menu = (
        <Popover id={this.props.id} placement='right' title={this.props.header}
          arrowOffsetTop={ContextMenu.ArrowOffset}
          positionLeft={this.state.left} positionTop={this.state.top}>
          <ListGroup>
            {this.renderMenuItems()}
          </ListGroup>
        </Popover>
      );
    }

    return (
      <div className='ContextMenu-menu'>
        {menu}
      </div>
    );
  }

  private handleClick(e: React.MouseEvent) {
    let isVisible = e.button === 2;

    if (isVisible) {
      e.preventDefault();

      this.setState({
        isVisible,
        left: e.pageX,
        top: e.pageY - ContextMenu.ArrowOffset
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

    return (
      <div className='ContextMenu'>
        <div className='ContextMenu-target' onContextMenu={e => this.handleClick(e)}>
          {this.props.children}
        </div>
        <Overlay show={this.state.isVisible} rootClose onHide={() => this.hide()}>
          {this.renderMenu()}
        </Overlay>
      </div>
    );
  }
}

export default ContextMenu;
