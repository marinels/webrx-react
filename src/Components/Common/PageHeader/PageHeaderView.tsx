import * as React from 'react';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Button } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { SearchView } from '../Search/SearchView';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Sidebar } from './Sidebar';
import { PageHeaderViewModel } from './PageHeaderViewModel';
import { HeaderMenuItem } from './Actions';

import './PageHeader.less';

export interface PageHeaderProps extends BaseViewProps {
  brand?: any;
}

export class PageHeaderView extends BaseView<PageHeaderProps, PageHeaderViewModel> {
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

  private isMenuItemDisabled(item: HeaderMenuItem) {
    let isDisabled = true;

    if (item.command == null && String.isNullOrEmpty(item.uri) === false) {
      isDisabled = false;
    }
    else if (item.command != null && item.command.canExecute(item.commandParameter) === true) {
      isDisabled = false;
    }

    return isDisabled;
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { brand } = x;
      return { brand };
    });

    return (
      <div { ...rest } className={ classNames('PageHeader', className) }>
        <Navbar fixedTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              <Button className='PageHeader-brand' ref='brand' bsStyle='link' active={ this.state.isSidebarVisible() }
                onClick={ this.bindEventToCommand(x => x.toggleSideBar, () => null) }
              >
                { props.brand }
              </Button>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav className='PageHeader-routedMenus'>
              { this.renderRoutedMenus() }
            </Nav>
            <Nav className='PageHeader-siteMenus' pullRight>
              { this.renderHelpMenu() }
              { this.renderAdminMenu() }
              { this.renderUserMenu() }
            </Nav>
            { this.renderSearch() }
            { this.renderRoutedActions() }
          </Navbar.Collapse>
        </Navbar>
        { this.renderSidebar() }
      </div>
    );
  }

  private renderHeaderMenu(id: any, header: any, items: HeaderMenuItem[], noCaret = false, className?: string) {
    return this.renderConditional((items || []).length > 0, () => (
      <NavDropdown id={ id } key={ id } title={ header } noCaret={ noCaret } className={ classNames(`PageHeader-${ id }`, className) }>
        {
          items
            .map(x => (
              <MenuItem key={ x.id } disabled={ this.isMenuItemDisabled(x) } href={ x.uri }
                onSelect={ x.uri == null ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : null }
              >
                { String.isNullOrEmpty(x.iconName) ? null : <Icon name={ x.iconName } fixedWidth /> }
                { x.header }
              </MenuItem>
            ))
        }
      </NavDropdown>
    ));
  }

  private renderRoutedMenus() {
    return this.renderConditional(
      this.state.navbarMenus != null && this.state.navbarMenus.length() > 0, () =>
        this.state.navbarMenus
          .toArray()
          .map((x, i) =>
            this.renderHeaderMenu(
              x.id,
              x.header,
              x.items
                .asEnumerable()
                .orderBy(y => y.order || 0)
                .toArray()
            )
          )
    );
  }

  private renderHelpMenu() {
    return this.renderHeaderMenu(
      'helpMenu',
      (<Icon name='question-circle' size='2x' />),
      this.state.helpMenuItems.toArray(),
      true
    );
  }

  private renderAdminMenu() {
    return this.renderHeaderMenu(
      'adminMenu',
      (<Icon className='hover-tilt' name='cog' size='2x' />),
      this.state.adminMenuItems.toArray(),
      true,
      'hover-tilt-host'
    );
  }

  private renderUserMenu() {
    return this.renderHeaderMenu(
      'userMenu',
      (<ProfilePicture src={ this.state.userImage } title={ this.state.userDisplayName } iconSize='2x' size={ 30 } />),
      this.state.userMenuItems.toArray(),
      true
    );
  }

  private renderSearch() {
    return this.renderConditional(this.state.search != null, () => (
      <Navbar.Form pullRight>
        <SearchView viewModel={ this.state.search } />
      </Navbar.Form>
    ));
  }

  private renderRoutedActions() {
    return (
      <Navbar.Form className='PageHeader-routedActions' pullRight>
        {
          this.renderConditional(
            this.state.navbarActions != null && this.state.navbarActions.length() > 0, () =>
              this.state.navbarActions
                .toArray()
                .filter(x => x.command != null && x.command.canExecute(x.commandParameter) === true)
                .map(x => (
                  <Button key={ x.id } className='PageHeader-actionButton' bsStyle={x.bsStyle}
                    disabled={ x.command == null || x.command.canExecute(x.commandParameter) === false }
                    onClick={ () => x.command.execute(x.commandParameter) }
                  >
                    { String.isNullOrEmpty(x.iconName) ? null : <Icon className='PageHeader-actionHeaderIcon' name={ x.iconName } /> }
                    <span className='PageHeader-actionHeaderText'>{ x.header }</span>
                  </Button>
                ))
          )
        }
      </Navbar.Form>
    );
  }

  private renderSidebar() {
    return (
      <Sidebar isVisible={ this.state.isSidebarVisible() }
        header={ this.props.brand }
        onHide={ this.bindEventToCommand(x => x.toggleSideBar, () => false) }
      >
        {
          this.renderConditional(this.state.isSidebarVisible, () =>
            this.state.sidebarMenus
              .toArray()
              .asEnumerable()
              .orderBy(x => x.order)
              .map(menu => (
                <Nav key={ menu.id }>
                  <NavItem className='PageHeader-sidebarSection' disabled>
                    { menu.header }
                  </NavItem>
                  {
                    menu.items
                      .asEnumerable()
                      .orderBy(x => x.order)
                      .map(x => (
                        <NavItem key={ x.id } disabled={ this.isMenuItemDisabled(x) } href={ x.uri }
                          onClick={ x.uri == null ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : this.bindEventToCommand(vm => vm.toggleSideBar, () => false) }
                        >
                          {
                            this.renderConditional(String.isNullOrEmpty(x.iconName) == null, () => (
                              <Icon name={ x.iconName } fixedWidth />
                            ))
                          }
                          { x.header }
                        </NavItem>
                      ))
                      .toArray()
                  }
                </Nav>
              ))
              .toArray()
          )
        }
      </Sidebar>
    );
  }
}
