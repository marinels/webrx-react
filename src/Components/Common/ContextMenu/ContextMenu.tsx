'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';

import { Overlay, Popover, ListGroup, ListGroupItem } from 'react-bootstrap';

import Icon from '../Icon/Icon';

import './ContextMenu.less'

export class MenuItem {
  public static displayName = 'MenuItem';

  constructor(public content: any, public onSelect?: () => void, public iconName?: any) {
  }

  private handleClick(e: React.MouseEvent, hide: () => void) {
    if (this.onSelect != null) {
      this.onSelect();
    }

    hide();
  }

  public render(index: number, hide: () => void) {
    return (
      <ListGroupItem className='ContextMenu-item' key={index} disabled={this.onSelect == null} onClick={e => this.handleClick(e, hide)}>
        <div className='ContextMenu-itemIcon'>
          <Icon name={this.iconName} fixedWidth />
        </div>
        <div className='ContextMenu-itemContent'>
          {this.content}
        </div>
      </ListGroupItem>
    )
  }
}

interface IContextMenuProps {
  id: string;
  header: string;
  items: MenuItem[];
  offsetX?: number;
  offsetY?: number;
  children?: any;
}

interface IContextMenuState {
  isVisible: boolean;
  target: any;
  offsetX: number;
  offsetY: number;
}

export class ContextMenu extends React.Component<IContextMenuProps, IContextMenuState> {
  public static displayName = 'ContextMenu';

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

    if (this.state.offsetX != null && this.state.offsetY != null) {
      menu = (
        <Popover id={this.props.id} placement='right' title={this.props.header}
          arrowOffsetTop={20}
          positionLeft={this.state.offsetX} positionTop={this.state.offsetY}>
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

      let elem = $(e.currentTarget);
      let offset = elem.offset();

      this.setState({
        isVisible,
        target: e.currentTarget,
        offsetX: e.screenX - offset.left + this.props.offsetX,
        offsetY: e.screenY - offset.top + this.props.offsetY
      });
    }
  }

  private hide() {
    this.setState({
      isVisible: false,
      target: null,
      offsetX: null,
      offsetY: null,
    });
  }

  render() {

    return (
      <div className='ContextMenu'>
        <div className='ContextMenu-target' onContextMenu={e => this.handleClick(e)}>
          {this.props.children}
        </div>
        <Overlay show={this.state.isVisible} container={this} rootClose onHide={() => this.hide()}>
          {this.renderMenu()}
        </Overlay>
      </div>
    );
  }
}

export default ContextMenu;
