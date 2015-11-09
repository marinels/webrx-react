'use strict';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as $ from 'jquery';

import { Overlay, Popover, ListGroup, ListGroupItem, Glyphicon } from 'react-bootstrap';

import './ContextMenu.less'

export class MenuItem {
  public static displayName = 'MenuItem';

  constructor(public content: any, public onSelect?: () => void, public glyph?: any) {
  }

  private handleClick(e: React.MouseEvent, hide: () => void) {
    if (this.onSelect != null) {
      this.onSelect();
    }

    hide();
  }

  public render(index: number, hide: () => void) {
    let glyph = this.glyph == null ? null : (
      <Glyphicon glyph={this.glyph} />
    );

    return (
      <ListGroupItem className='ContextMenu-item' key={index} disabled={this.onSelect == null} onClick={e => this.handleClick(e, hide)}>
        <div className='ContextMenu-itemGlyph'>
          {glyph}
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
        <Popover id={this.props.id} placement='bottom' title={this.props.header}
          arrowOffsetLeft={20}
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
        offsetX: e.pageX - offset.left,
        offsetY: e.pageY - offset.top
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
