import * as React from 'react';
import { Icon } from 'react-fa';
import * as classNames from 'classnames';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { CommandButton } from '../CommandButton/CommandButton';
import { SearchView } from '../Search/SearchView';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Sidebar } from './Sidebar';
import { PageHeaderViewModel } from './PageHeaderViewModel';
import { HeaderAction, HeaderCommandAction } from '../../React/Actions';

import './PageHeader.less';

export interface PageHeaderProps extends BaseViewProps {
  id?: string;
  brand?: any;
  branduri?: string;
}

export class PageHeaderView extends BaseView<PageHeaderProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps = {
    id: 'page-header',
    brand: 'WebRx-React Rocks!!!',
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

  private isSidebarEnabled() {
    return String.isNullOrEmpty(this.props.branduri);
  }

  private isActionDisabled(item: HeaderCommandAction) {
    let isDisabled = true;

    if (item.command == null && String.isNullOrEmpty(item.uri) === false) {
      isDisabled = false;
    }
    else if (item.command != null && item.command.canExecute(item.commandParameter) === true) {
      isDisabled = false;
    }

    return isDisabled;
  }

  private getOrderedActions<T extends HeaderAction>(items: T[]) {
    return (items || [])
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  private getVisibleActions(items: HeaderCommandAction[]) {
    return this.getOrderedActions(
      (items || [])
        .filter(x => x.visibleWhenDisabled === true || this.isActionDisabled(x) === false),
    );
  }

  private updatePadding() {
    const elem = document.getElementById(this.props.id!) as HTMLElement;
    const padding = ((elem.children.item(0) || {}).clientHeight || 0);

    if (elem != null && padding > 0) {
      elem.style.paddingBottom = `${ padding + 1 }px`;
    }
  }

  loaded() {
    super.loaded();

    window.onresize = () => {
      this.updatePadding();
    };

    this.updatePadding();
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { brand, branduri } = x;
      return { brand, branduri };
    });

    return (
      <div { ...rest } className={ classNames('PageHeader', className) }>
        <Navbar fixedTop fluid>
          <Navbar.Header>
            <Navbar.Brand>
              { this.renderBrandButton() }
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
        { this.renderConditional(this.isSidebarEnabled(), () => this.renderSidebar()) }
      </div>
    );
  }

  private renderBrandButton() {
    const isSidebarEnabled = this.isSidebarEnabled();
    const active = isSidebarEnabled && this.state.isSidebarVisible();
    const command = isSidebarEnabled ? this.state.toggleSideBar : undefined;

    return (
      <CommandButton className='PageHeader-brand' bsStyle='link' active={ active } href={ this.props.branduri } command={ command }>
        { this.props.brand }
      </CommandButton>
    );
  }

  private renderHeaderMenu(id: any, header: any, items: HeaderCommandAction[], noCaret = false, className?: string) {
    const visibleItems = this.getVisibleActions(items);

    return this.renderConditional(visibleItems.length > 0, () => (
      <NavDropdown id={ id } key={ id } title={ header } noCaret={ noCaret } className={ classNames(`PageHeader-${ id }`, className) }>
        {
          visibleItems
            .map(x => (
              <MenuItem key={ x.id } disabled={ this.isActionDisabled(x) } href={ x.uri }
                onSelect={ String.isNullOrEmpty(x.uri) === true ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : null }
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
    return this.renderConditional(this.state.navbarMenus.length() > 0, () =>
      this.getOrderedActions(this.state.navbarMenus.toArray())
        .map(x => {
          return this.renderHeaderMenu(
            x.id,
            x.header,
            x.items,
          );
        })
        .filter(x => x != null),
    );
  }

  private renderHelpMenu() {
    return this.renderHeaderMenu(
      'helpMenu',
      (<Icon name='question-circle' size='2x' />),
      this.state.helpMenuItems.toArray(),
      true,
    );
  }

  private renderAdminMenu() {
    return this.renderHeaderMenu(
      'adminMenu',
      (<Icon name='cog' size='2x' />),
      this.state.adminMenuItems.toArray(),
      true,
      'hover-spin',
    );
  }

  private renderUserMenu() {
    return this.renderHeaderMenu(
      'userMenu',
      (<ProfilePicture src={ this.state.userImage } title={ this.state.userDisplayName } iconSize='2x' size={ 30 } />),
      this.state.userMenuItems.toArray(),
      true,
    );
  }

  private renderSearch() {
    return this.renderNullable(this.state.search, x => (
      <Navbar.Form pullRight>
        <SearchView viewModel={ x } />
      </Navbar.Form>
    ));
  }

  private renderRoutedActions() {
    const visibleActions = this.getVisibleActions(this.state.navbarActions.toArray());

    return (
      <Navbar.Form className='PageHeader-routedActions' pullRight>
        {
          this.renderConditional(visibleActions.length > 0, () =>
            visibleActions
              .map(x => (
                <CommandButton key={ x.id } className='PageHeader-actionButton' bsStyle={ x.bsStyle }
                  href={ x.uri } command={ x.command } commandParameter={ x.commandParameter }
                >
                  { String.isNullOrEmpty(x.iconName) ? null : <Icon className='PageHeader-actionHeaderIcon' name={ x.iconName } /> }
                  <span className='PageHeader-actionHeaderText'>{ x.header }</span>
                </CommandButton>
              )),
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
            this.getOrderedActions(this.state.sidebarMenus.toArray())
              .map(menu => {
                const visibleActions = this.getVisibleActions(menu.items);

                return this.renderConditional(visibleActions.length > 0, () => (
                  <Nav key={ menu.id }>
                    <NavItem className='PageHeader-sidebarSection' disabled>
                      { menu.header }
                    </NavItem>
                    {
                      visibleActions
                        .map(x => (
                          <NavItem key={ x.id } disabled={ this.isActionDisabled(x) } href={ x.uri }
                            onClick={ String.isNullOrEmpty(x.uri) === true ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : this.bindEventToCommand(vm => vm.toggleSideBar, () => false) }
                          >
                            {
                              this.renderConditional(String.isNullOrEmpty(x.iconName) === false, () => (
                                <Icon name={ x.iconName! } fixedWidth />
                              ))
                            }
                            { x.header }
                          </NavItem>
                        ))
                    }
                  </Nav>
                ));
              })
              .filter(x => x != null),
          )
        }
      </Sidebar>
    );
  }
}
