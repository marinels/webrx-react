'use strict';

import * as Rx from 'rx';
import * as React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, NavDropdownProps, MenuItem, Button } from 'react-bootstrap';
import { Image } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import SearchView from '../Search/SearchView';
import Icon from '../Icon/Icon';

import PageHeaderViewModel from './PageHeaderViewModel';
import { IMenuItem } from './Actions'

import './PageHeader.less';

interface IPageHeaderProps extends IBaseViewProps {
  brand?: any;
}

export class PageHeaderView extends BaseView<IPageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps = {
    brand: 'WebRx.React Rocks!!!'
  }

  updateOn() {
    return [
      this.state.appSwitcherMenuItems.listChanged,
      this.state.appMenus.listChanged,
      this.state.appActions.listChanged,
      this.state.helpMenuItems.listChanged,
      this.state.adminMenuItems.listChanged,
      this.state.userMenuItems.listChanged,
    ]
  }

  private isMenuItemDisabled(item: IMenuItem) {
    let isDisabled = true;

    if (item.command == null && String.isNullOrEmpty(item.uri) === false) {
      isDisabled = false;
    } else if (item.command != null && item.command.canExecute(null) === true) {
      isDisabled = false;
    }

    return isDisabled;
  }

  private createMenu(items: wx.IObservableList<IMenuItem> | IMenuItem[], propsCreator: () => NavDropdownProps, defaultValue?: any) {
    return (items == null || items.length === 0 || (items.length as wx.IObservableProperty<number>)() === 0) ? defaultValue : (
      <NavDropdown {...propsCreator()}>
        {
          items.map(x => {
            let icon = <Icon name={x.iconName} fixedWidth />;
            return (
              <MenuItem key={x.id} disabled={this.isMenuItemDisabled(x)} onSelect={this.bindEvent(x => x.menuItemSelected, null, () => x)}>
                {icon}
                <span className='MenuItem-text'>{x.title}</span>
              </MenuItem>
            );
          })
        }
      </NavDropdown>
    );
  }

  render() {
    let userIcon = this.state.userImage == null ?
      <Icon name='bs-user' /> :
      <Image className='PageHeader-profilePicture' rounded src={this.state.userImage} />;

    let eventKey = 1;

    let appMenus = (this.state.appMenus == null || this.state.appMenus.length() === 0) ? null : (
      this.state.appMenus.map(x => this.createMenu(x.items, () => ({
        id: x.id,
        key: x.id,
        eventKey: eventKey++,
        title: x.header
      })))
    );

    let appActions = (this.state.appActions == null || this.state.appActions.length() === 0) ? null : (
      this.state.appActions.map(x => (
        <Button key={x.id} className='PageHeader-actionButton'
          disabled={x.command == null || x.command.canExecute(null) === false}
          onClick={() => { if (x.command != null) { x.command.execute(x); } }}>
          {x.header}
        </Button>
      ))
    );

    let search = (this.state.search == null) ? null : (
      <form className='PageHeader-navSearch navbar-form navbar-right' role='search'>
        <SearchView viewModel={this.state.search} />
      </form>
    )

    return (
      <div className='PageHeader'>
        <Navbar fluid>
          <Nav className='PageHeader-navBrand'>
            {this.createMenu(this.state.appSwitcherMenuItems, () => ({
              id: 'app-switcher',
              eventKey: 0,
              noCaret: true,
              title: (<Icon name='bs-menu-hamburger' />)
            }))}
            <NavItem className='PageHeader-brand' href={this.state.homeLink}>{this.props.brand}</NavItem>
          </Nav>
          <Nav className='PageHeader-navMenus'>
            {appMenus}
          </Nav>
          <form className='PageHeader-navActions navbar-form navbar-left'>
            {appActions}
          </form>
          <Nav className='PageHeader-navUser' pullRight>
            {this.createMenu(this.state.adminMenuItems, () => ({
              id: 'admin-menu',
              eventKey: eventKey++,
              title: (<Icon name='bs-cog' />)
            }))}
            {this.createMenu(this.state.userMenuItems, () => ({
              id: 'user-menu',
              eventKey: eventKey++,
              title: userIcon
            }), <NavItem>{userIcon}</NavItem>)}
          </Nav>
          <Nav className='PageHeader-navSite' pullRight>
            {this.createMenu(this.state.helpMenuItems, () => ({
              id: 'help-menu',
              eventKey: eventKey++,
              title: (<Icon name='bs-question-sign' />)
            }))}
          </Nav>
          {search}
      </Navbar>
    </div>
    );
  }
}

export default PageHeaderView;
