import * as React from 'react';

import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Button } from 'react-bootstrap';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { SearchView } from '../Search/SearchView';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Sidebar } from './Sidebar';
import { PageHeaderViewModel } from './PageHeaderViewModel';
import { IMenuItem } from './Actions';

import './PageHeader.less';

interface IPageHeaderProps extends IBaseViewProps {
  brand?: any;
}

export class PageHeaderView extends BaseView<IPageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps = {
    brand: 'WebRx.React Rocks!!!',
  };

  updateOn() {
    return [
      this.state.sidebarMenus.listChanged,
      this.state.navbarMenus.listChanged,
      this.state.navbarActions.listChanged,
      this.state.helpMenuItems.listChanged,
      this.state.adminMenuItems.listChanged,
      this.state.userMenuItems.listChanged,
      this.state.isSidebarVisible.changed,
    ];
  }

  private isMenuItemDisabled(item: IMenuItem) {
    let isDisabled = true;

    if (item.command == null && String.isNullOrEmpty(item.uri) === false) {
      isDisabled = false;
    }
    else if (item.command != null && item.command.canExecute(item.commandParameter) === true) {
      isDisabled = false;
    }

    return isDisabled;
  }

  private createHeaderMenu(id: any, header: any, items: IMenuItem[], noCaret = false, className?: string) {
    return items.length === 0 ? null : (
      <NavDropdown id={id} key={id} title={header} noCaret={noCaret} className={classNames(`PageHeader-${id}`, className)}>
        {
          items
            .asEnumerable()
            .select(x => (
              <MenuItem key={x.id} disabled={this.isMenuItemDisabled(x)} href={x.uri}
                onSelect={x.uri == null ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : null}
              >
                { String.isNullOrEmpty(x.iconName) ? null : <Icon name={x.iconName} fixedWidth /> }
                { x.header }
              </MenuItem>
            ))
            .toArray()
        }
      </NavDropdown>
    );
  }

  render() {
    return (
      <div className='PageHeader'>
        <Navbar fixedTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <Button className='PageHeader-brand' ref='brand' bsStyle='link' active={this.state.isSidebarVisible()}
                onClick={this.bindEventToCommand(x => x.toggleSideBar, () => null)}
              >
                {this.props.brand}
              </Button>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav className='PageHeader-routedMenus'>
              {
                this.renderConditional(
                  this.state.navbarMenus != null && this.state.navbarMenus.length() > 0, () =>
                    this.state.navbarMenus
                      .toArray()
                      .asEnumerable()
                      .select((x, i) =>
                        this.createHeaderMenu(
                          x.id,
                          x.header,
                          x.items
                            .sort((a, b) => (a.order || 0) - (b.order || 0))
                        )
                      )
                      .toArray()
                )
              }
            </Nav>
            <Nav className='PageHeader-siteMenus' pullRight>
              {
                this.createHeaderMenu(
                  'helpMenu',
                  (<Icon name='question-circle' size='2x' />),
                  this.state.helpMenuItems.toArray(),
                  true
                )
              }
              {
                this.createHeaderMenu(
                  'adminMenu',
                  (<Icon className='hover-tilt' name='cog' size='2x' />),
                  this.state.adminMenuItems.toArray(),
                  true,
                  'hover-tilt-host'
                )
              }
              {
                this.createHeaderMenu(
                  'userMenu',
                  (<ProfilePicture src={this.state.userImage} title={this.state.userDisplayName} iconSize='2x' />),
                  this.state.userMenuItems.toArray(),
                  true
                )
              }
            </Nav>
              {
                this.renderConditional(this.state.search != null, () =>
                  <Navbar.Form pullRight>
                    <SearchView viewModel={this.state.search} />
                  </Navbar.Form>
                )
              }
            <Navbar.Form className='PageHeader-routedActions' pullRight>
              {
                this.renderConditional(
                  this.state.navbarActions != null && this.state.navbarActions.length() > 0, () =>
                    this.state.navbarActions
                      .toArray()
                      .asEnumerable()
                      .where(x => x.command != null && x.command.canExecute(x.commandParameter) === true)
                      .select(x => (
                        <Button key={x.id} className='PageHeader-actionButton' bsStyle={x.bsStyle}
                          disabled={x.command == null}
                          onClick={() => x.command.execute(x) }
                        >
                          { String.isNullOrEmpty(x.iconName) ? null : <Icon className='PageHeader-actionHeaderIcon' name={x.iconName} /> }
                          <span className='PageHeader-actionHeaderText'>{x.header}</span>
                        </Button>
                      ))
                      .toArray()
                )
              }
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>
        <Sidebar isVisible={this.state.isSidebarVisible()}
          header={this.props.brand}
          onHide={this.bindEventToCommand(x => x.toggleSideBar, () => false)}
        >
          {
            this.state.sidebarMenus
              .toArray()
              .asEnumerable()
              .orderBy(x => x.order)
              .select(menu => (
                <Nav key={menu.id}>
                  <NavItem disabled>{menu.header}</NavItem>
                  {
                    menu.items
                      .asEnumerable()
                      .orderBy(x => x.order)
                      .select(x => (
                        <NavItem key={x.id} disabled={this.isMenuItemDisabled(x)} href={x.uri}
                          onClick={x.uri == null ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : this.bindEventToCommand(vm => vm.toggleSideBar, () => false)}
                        >
                          { String.isNullOrEmpty(x.iconName) ? null : <Icon name={x.iconName} fixedWidth /> }
                          { x.header }
                        </NavItem>
                      ))
                      .toArray()
                  }
                </Nav>
              ))
              .toArray()
          }
        </Sidebar>
      </div>
    );
  }
}
