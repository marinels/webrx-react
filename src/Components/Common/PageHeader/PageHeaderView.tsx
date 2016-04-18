'use strict';

import * as Rx from 'rx';
import * as React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, NavDropdownProps, MenuItem, Button } from 'react-bootstrap';
import { Image } from 'react-bootstrap';
import * as Icon from 'react-fa';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import SearchView from '../Search/SearchView';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import PageHeaderViewModel from './PageHeaderViewModel';
import { IMenuItem } from './Actions';

import './PageHeader.less';

interface IPageHeaderProps extends IBaseViewProps {
  brand?: any;
}

export class PageHeaderView extends BaseView<IPageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps = {
    brand: 'WebRx.React Rocks!!!'
  };

  updateOn() {
    return [
      this.state.appSwitcherMenuItems.listChanged,
      this.state.appMenus.listChanged,
      this.state.appActions.listChanged,
      this.state.helpMenuItems.listChanged,
      this.state.adminMenuItems.listChanged,
      this.state.userMenuItems.listChanged,
    ];
  }

  private isMenuItemDisabled(item: IMenuItem) {
    let isDisabled = true;

    if (item.command == null && String.isNullOrEmpty(item.uri) === false) {
      isDisabled = false;
    } else if (item.command != null && item.command.canExecute(item.commandParameter) === true) {
      isDisabled = false;
    }

    return isDisabled;
  }

  private createMenu(items: wx.IObservableList<IMenuItem> | IMenuItem[], icon: any, propsCreator: () => any, defaultValue?: any) {
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
      // title as any: the typings for NavDropdownProps incorrectly define title as a string
      <NavDropdown title={title as any} {...propsCreator()}>
        {
          items.map(x => {
            let icon = String.isNullOrEmpty(x.iconName) ? null : <Icon name={x.iconName} fixedWidth />;
            let onSelect = x.uri == null ? this.bindEvent(x => x.menuItemSelected, () => x) : null;
            return (
              <MenuItem key={x.id} disabled={this.isMenuItemDisabled(x)} href={x.uri} onSelect={onSelect}>
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
    let eventKey = 1;

    let appMenus = (this.state.appMenus == null || this.state.appMenus.length() === 0) ? null : (
      this.state.appMenus.map(x => this.createMenu(x.items.sort((a, b) => (a.order || 0) - (b.order || 0)), x.header, () => ({
        id: x.id,
        key: x.id,
        eventKey: eventKey++
      })))
    );

    let appActions = (this.state.appActions == null || this.state.appActions.length() === 0) ? null : (
      this.state.appActions
        .filter(x => x.command.canExecute(x.commandParameter) === true)
        .map(x => (
          <Button key={x.id} className='PageHeader-actionButton' bsStyle={x.bsStyle}
            disabled={x.command == null}
            onClick={() => { if (x.command != null) { x.command.execute(x); } }}>
            <div className='PageHeader-actionHeader'>
              { String.isNullOrEmpty(x.iconName) ? null : <Icon className='PageHeader-actionHeaderIcon' name={x.iconName} /> }
              <span className='PageHeader-actionHeaderText'>{x.header}</span>
            </div>
          </Button>
        ))
    );

    let search = (this.state.search == null) ? null : (
      <form className='PageHeader-navSearch navbar-form navbar-right' role='search'>
        <SearchView viewModel={this.state.search} />
      </form>
    );

    return (
      <div className='PageHeader'>
        <Navbar fluid>
          <Nav className='PageHeader-navBrand'>
            {this.createMenu(this.state.appSwitcherMenuItems, (<Icon name='bars' size='lg' />), () => ({
              id: 'app-switcher',
              eventKey: 0,
              noCaret: true
            }))}
            <NavItem className='PageHeader-brand' href={this.state.homeLink}>{this.props.brand}</NavItem>
          </Nav>
          <Nav className='PageHeader-navMenus'>
            {appMenus}
          </Nav>
          <Nav className='PageHeader-navSite' pullRight>
            {this.createMenu(this.state.helpMenuItems, (<Icon name='question-circle' size='lg' />), () => ({
              id: 'help-menu',
              className: 'PageHeader-iconNavItem PageHeader-navHelp',
              eventKey: eventKey++,
              noCaret: true
            }))}
            {this.createMenu(this.state.adminMenuItems, (<Icon className='hover-tilt' name='cog' size='lg' />), () => ({
              id: 'admin-menu',
              className: 'PageHeader-iconNavItem PageHeader-navAdmin hover-tilt-host',
              eventKey: eventKey++,
              noCaret: true
            }))}
            {this.createMenu(this.state.userMenuItems, (<ProfilePicture src={this.state.userImage} title={this.state.userDisplayName} iconSize='lg' block />), () => ({
              id: 'user-menu',
              className: 'PageHeader-iconNavItem PageHeader-navUser',
              eventKey: eventKey++,
              noCaret: true
            }))}
          </Nav>
          {search}
          <form className='PageHeader-navActions navbar-form navbar-right'>
            {appActions}
          </form>
      </Navbar>
    </div>
    );
  }
}

export default PageHeaderView;
