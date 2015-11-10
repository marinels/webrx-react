'use strict';

import * as Rx from 'rx';
import * as React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, NavDropdownProps, MenuItem } from 'react-bootstrap';
import { Glyphicon, Image } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import { PageHeaderViewModel, IMenuItem } from './PageHeaderViewModel';

import './PageHeader.less';

interface IPageHeaderProps extends IBaseViewProps {
  brand?: any;
}

export class PageHeaderView extends BaseView<IPageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps = {
    brand: 'WebRx.React Rocks!!!'
  }

  private createMenu(items: IMenuItem[], props: NavDropdownProps) {
    return (items == null || items.length == 0) ? null : (
      <NavDropdown {...props}>
        {
          items.map(x => {
            let icon = x.glyph == null ? null : <Glyphicon glyph={x.glyph} />;
            return (
              <MenuItem key={x.id} onSelect={this.bindEvent(x => x.menuItemSelected, () => x)}>
                <span className='MenuItem-text'>{icon}{x.title}</span>
              </MenuItem>
            );
          })
        }
      </NavDropdown>
    );
  }

  render() {
    let userIcon = this.state.userImage == null ?
      <Glyphicon glyph='user' /> :
      <Image rounded src={this.state.userImage} />;

    return (
      <div className='PageHeader'>
        <Navbar fluid>
          <Nav>
            {this.createMenu(this.state.appSwitcherMenuItems, {
              id: 'app-switcher',
              eventKey: 0,
              noCaret: true,
              title: (<Glyphicon glyph='menu-hamburger' />)
            })}
            <NavItem className='PageHeader-brand' href='#/'>{this.props.brand}</NavItem>
          </Nav>
          <Nav right>
            {this.createMenu(this.state.adminMenuItems, {
              id: 'admin-menu',
              eventKey: 1,
              title: (<Glyphicon glyph='cog' />)
            })}
            {this.createMenu(this.state.userMenuItems, {
              id: 'user-menu',
              eventKey: 2,
              title: userIcon
            })}
          </Nav>
      </Navbar>
    </div>
    );
  }
}

export default PageHeaderView;
