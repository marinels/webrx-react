import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Observable } from 'rxjs';
import { Icon, IconStack } from 'react-fa';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap';

import { BaseView, BaseViewProps, HeaderAction, HeaderCommandAction, HeaderMenu } from '../../React';
import { CommandButton } from '../CommandButton/CommandButton';
import { SearchView } from '../Search/SearchView';
import { ProfilePicture } from '../ProfilePicture/ProfilePicture';
import { Sidebar } from './Sidebar';
import { PageHeaderViewModel } from './PageHeaderViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';

export interface PageHeaderProps {
  brand?: any;
  branduri?: string;
  fixed?: boolean;
}

export interface PageHeaderViewProps extends BaseViewProps<PageHeaderViewModel>, PageHeaderProps {
}

export class PageHeaderView extends BaseView<PageHeaderViewProps, PageHeaderViewModel> {
  public static displayName = 'PageHeaderView';

  static defaultProps: Partial<PageHeaderProps> = {
    brand: 'webrx-react Rocks!!!',
  };

  private containerRef = React.createRef<HTMLDivElement>();
  private navBarRef = React.createRef<Navbar>();

  updateOn(viewModel: Readonly<PageHeaderViewModel>) {
    return [
      viewModel.sidebarMenus.changed,
      viewModel.navbarMenus.changed,
      viewModel.navbarActions.changed,
      viewModel.helpMenuItems.changed,
      viewModel.adminMenuItems.changed,
      viewModel.userMenuItems.changed,
      viewModel.isSidebarVisible.changed,
      viewModel.menuItemChanged.results,
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
    else if (item.command != null && item.command.canExecute === true) {
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

  loaded() {
    super.loaded();

    if (this.props.fixed) {
      window.onresize = () => {
        this.layoutNavBar();
      };

      this.layoutNavBar();
    }
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { brand, branduri, fixed } = x;
      return { brand, branduri, fixed };
    });

    return (
      <div ref={ this.containerRef } { ...rest }
        className={ this.wxr.classNames('PageHeader', className) }
      >
        <Navbar ref={ this.navBarRef } fixedTop={ props.fixed } fluid>
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
        { this.wxr.renderConditional(this.isSidebarEnabled(), () => this.renderSidebar()) }
      </div>
    );
  }

  private layoutNavBar() {
    const container = this.containerRef.current;
    const navBar = this.navBarRef.current && ReactDOM.findDOMNode(this.navBarRef.current) as HTMLDivElement;

    if (container && navBar) {
      const rect = container.getBoundingClientRect();

      container.style.paddingBottom = `${ navBar.clientHeight + 1 }px`;
    }
  }

  private renderBrandButton() {
    const isSidebarEnabled = this.isSidebarEnabled();
    const active = isSidebarEnabled && this.viewModel.isSidebarVisible.value;
    const command = isSidebarEnabled ? this.viewModel.toggleSideBar : undefined;

    return (
      <CommandButton className='PageHeader-brand' bsStyle='link' active={ active } href={ this.props.branduri } command={ command }>
        { this.props.brand }
      </CommandButton>
    );
  }

  private renderHeaderMenu(id: any, header: any, items: HeaderCommandAction[], noCaret = false, className?: string) {
    const visibleItems = this.getVisibleActions(items);

    return this.wxr.renderConditional(visibleItems.length > 0, () => (
      <NavDropdown id={ id } key={ id } title={ header } noCaret={ noCaret } className={ this.wxr.classNames(`PageHeader-${ id }`, className) }>
        {
          visibleItems
            .map(x => (
              <MenuItem key={ x.id } disabled={ this.isActionDisabled(x) } href={ x.uri }
                onSelect={ String.isNullOrEmpty(x.uri) === true ? this.bindEventToCommand(vm => vm.menuItemSelected, () => x) : null }
              >
                { this.renderHeaderCommandActionIcon(x) }
                { x.header }
              </MenuItem>
            ))
        }
      </NavDropdown>
    ));
  }

  private renderHeaderCommandActionIcon(item: HeaderCommandAction, className?: string, fixedWidth = true) {
    const stackProps = { className };
    const props = { fixedWidth, ...stackProps };

    if (Array.isArray(item.iconName)) {
      const names = item.iconName
        .filter(x => String.isNullOrEmpty(x) === false);

      if (names.length === 0) {
        return null;
      }
      else if (names.length === 1) {
        return (<Icon { ...props } name={ names[0] } />);
      }
      else {
        return (
          <IconStack { ...stackProps as any }>
            <Icon name={ names[0] } stack='2x' fixedWidth={ fixedWidth } />
            <Icon name={ names[1] } stack='1x' fixedWidth={ fixedWidth } />
          </IconStack>
        );
      }
    }
    else {
      return String.isNullOrEmpty(item.iconName) ? null : (<Icon { ...props } name={ item.iconName } />);
    }
  }

  private renderRoutedMenus() {
    return this.wxr.renderConditional(this.viewModel.navbarMenus.value.length > 0, () =>
      this.getOrderedActions(this.viewModel.navbarMenus.value)
        .map(x => {
          return this.renderHeaderMenu(
            x.id,
            x.header,
            x.items,
          );
        })
        .filterNull(),
    );
  }

  private renderHelpMenu() {
    return this.renderHeaderMenu(
      'helpMenu',
      (<Icon name='question-circle' size='2x' />),
      this.viewModel.helpMenuItems.value,
      true,
    );
  }

  private renderAdminMenu() {
    return this.renderHeaderMenu(
      'adminMenu',
      (<Icon name='cog' size='2x' />),
      this.viewModel.adminMenuItems.value,
      true,
      'hover-spin',
    );
  }

  private renderUserMenu() {
    return this.renderHeaderMenu(
      'userMenu',
      (<ProfilePicture src={ this.viewModel.userImage } title={ this.viewModel.userDisplayName } iconSize='2x' size={ 30 } />),
      this.viewModel.userMenuItems.value,
      true,
    );
  }

  private renderSearch() {
    if (this.viewModel.search instanceof SearchViewModel) {
      return (
        <Navbar.Form pullRight>
          <SearchView viewModel={ this.viewModel.search } />
        </Navbar.Form>
      );
    }

    return null;
  }

  private renderRoutedActions() {
    const visibleActions = this.getVisibleActions(this.viewModel.navbarActions.value);

    return (
      <Navbar.Form className='PageHeader-routedActions' pullRight>
        {
          this.wxr.renderConditional(visibleActions.length > 0, () =>
            visibleActions
              .map(x => (
                <CommandButton key={ x.id } className='PageHeader-actionButton' bsStyle={ x.bsStyle }
                  href={ x.uri } command={ x.command } commandParameter={ x.commandParameter }
                >
                  { this.renderHeaderCommandActionIcon(x, 'PageHeader-actionHeaderIcon', false) }
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
      <Sidebar isVisible={ this.viewModel.isSidebarVisible.value }
        header={ this.props.brand }
        onHide={ this.bindEventToCommand(x => x.toggleSideBar, () => false) }
      >
        {
          this.wxr.renderConditional(this.viewModel.isSidebarVisible, () =>
            this.getOrderedActions(this.viewModel.sidebarMenus.value)
              .map(menu => {
                const visibleActions = this.getVisibleActions(menu.items);

                return this.wxr.renderConditional(visibleActions.length > 0, () => (
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
                            { this.renderHeaderCommandActionIcon(x) }
                            { x.header }
                          </NavItem>
                        ))
                    }
                  </Nav>
                ));
              })
              .filterNull(),
          )
        }
      </Sidebar>
    );
  }
}
