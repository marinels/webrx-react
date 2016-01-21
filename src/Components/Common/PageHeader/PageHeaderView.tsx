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

  private createMenu(items: wx.IObservableList<IMenuItem> | IMenuItem[], icon: any, propsCreator: () => NavDropdownProps, defaultValue?: any) {
    let length = items == null ? null : items.length;
    if (length instanceof Function) {
      length = (length as wx.IObservableProperty<number>)();
    }
    let title = (
      <div className='PageHeader-menuTitle'>
        {icon}
      </div>
    );
    return length == null || length === 0 ? defaultValue : (
      <NavDropdown title={title} {...propsCreator()}>
        {
          items.map(x => {
            let icon = <Icon name={x.iconName} fixedWidth hidden={String.isNullOrEmpty(x.iconName)} />;
            return (
              <MenuItem key={x.id} disabled={this.isMenuItemDisabled(x)} onSelect={this.bindEvent(x => x.menuItemSelected, () => x)}>
                {icon}
                <span className='MenuItem-text'>{x.header}</span>
              </MenuItem>
            );
          })
        }
      </NavDropdown>
    );
  }

  render() {
    let userIcon = this.state.userImage == null ? <Icon name='fa-user' size='lg' /> : <Image src={this.state.userImage} />;

    let eventKey = 1;

    let appMenus = (this.state.appMenus == null || this.state.appMenus.length() === 0) ? null : (
      this.state.appMenus.map(x => this.createMenu(x.items.sort((a, b) => (a.order || 0) - (b.order || 0)), x.header, () => ({
        id: x.id,
        key: x.id,
        eventKey: eventKey++
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
            {this.createMenu(this.state.appSwitcherMenuItems, (<Icon name='fa-bars' size='lg' />), () => ({
              id: 'app-switcher',
              eventKey: 0,
              noCaret: true
            }))}
            <NavItem className='PageHeader-brand' href={this.state.homeLink}>{this.props.brand}</NavItem>
          </Nav>
          <Nav className='PageHeader-navMenus'>
            {appMenus}
          </Nav>
          <form className='PageHeader-navActions navbar-form navbar-left'>
            {appActions}
          </form>
          <Nav className='PageHeader-navSite' pullRight>
            {this.createMenu(this.state.helpMenuItems, (<Icon name='fa-question-circle' size='lg' />), () => ({
              id: 'help-menu',
              className: 'PageHeader-iconNavItem PageHeader-navHelp',
              eventKey: eventKey++,
              noCaret: true
            }))}
            {this.createMenu(this.state.adminMenuItems, (<Icon name='fa-cog' size='lg' />), () => ({
              id: 'admin-menu',
              className: 'PageHeader-iconNavItem PageHeader-navAdmin',
              eventKey: eventKey++,
              noCaret: true
            }))}
            {this.createMenu(this.state.userMenuItems, userIcon, () => ({
              id: 'user-menu',
              className: 'PageHeader-iconNavItem PageHeader-navUser',
              eventKey: eventKey++,
              noCaret: true
            }))}
          </Nav>
          {search}
      </Navbar>
    </div>
    );
  }
}

export default PageHeaderView;
