import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel, isRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { HeaderAction, HeaderCommandAction, HeaderMenu, isHeaderCommandAction } from '../../React/Actions';
import { RouteHandlerViewModel } from '../RouteHandler/RouteHandlerViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';
import { SubMan } from '../../../Utils/SubMan';

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  private dynamicSubs: SubMan;

  public search: SearchViewModel | undefined;
  public sidebarMenus: wx.IObservableProperty<HeaderMenu[]>;
  public navbarMenus: wx.IObservableProperty<HeaderMenu[]>;
  public navbarActions: wx.IObservableProperty<HeaderCommandAction[]>;
  public helpMenuItems: wx.IObservableProperty<HeaderCommandAction[]>;
  public adminMenuItems: wx.IObservableProperty<HeaderCommandAction[]>;
  public userMenuItems: wx.IObservableProperty<HeaderCommandAction[]>;
  public isSidebarVisible: wx.IObservableReadOnlyProperty<boolean>;

  public menuItemSelected: wx.ICommand<HeaderCommandAction>;
  public toggleSideBar: wx.ICommand<boolean>;

  constructor(
    public routeHandler: RouteHandlerViewModel,
    public staticSidebarMenus: HeaderMenu[] = [],
    public staticNavbarMenus: HeaderMenu[] = [],
    public staticNavbarActions: HeaderCommandAction[] = [],
    public staticHelpMenuItems: HeaderCommandAction[] = [],
    public staticAdminMenuItems: HeaderCommandAction[] = [],
    public staticUserMenuItems: HeaderCommandAction[] = [],
    public userImage?: string,
    public userDisplayName?: string,
    public homeLink = '#/',
  ) {
    super();

    this.dynamicSubs = new SubMan();

    this.sidebarMenus = wx.property<HeaderMenu[]>();
    this.navbarMenus = wx.property<HeaderMenu[]>();
    this.navbarActions = wx.property<HeaderCommandAction[]>();
    this.helpMenuItems = wx.property<HeaderCommandAction[]>();
    this.adminMenuItems = wx.property<HeaderCommandAction[]>();
    this.userMenuItems = wx.property<HeaderCommandAction[]>();

    this.toggleSideBar = wx.asyncCommand((isVisible: boolean) =>
      Observable.of(Object.fallback(isVisible, !this.isSidebarVisible())),
    );

    this.isSidebarVisible = wx
      .whenAny(this.toggleSideBar.results, x => x)
      .toProperty(false);

    this.menuItemSelected = wx.asyncCommand((x: HeaderCommandAction) => Observable.of(x));

    this.subscribe(
      wx
        .whenAny(this.menuItemSelected.results, x => x)
        .filter(x => x != null)
        .map(x => false)
        .invokeCommand(this.toggleSideBar),
    );

    this.subscribeOrAlert(
      () => wx
        .whenAny(this.menuItemSelected.results, x => x)
        .filter(x => x != null),
      'Page Header Menu Item Error',
      x => {
        if (x.command != null) {
          x.command.execute(x.commandParameter);
        }
        else if (x.uri != null && x.uri.length > 0) {
          if (x.uri[0] === '#') {
            this.navTo(x.uri);
          }
          else {
            window.location.href = x.uri;
          }
        }
      },
    );

    this.subscribe(
      wx
        .whenAny(this.routeHandler.routedComponent, x => x)
        .subscribe(x => {
          this.updateDynamicContent();
        }),
    );
  }

  public updateDynamicContent() {
    let component = this.routeHandler.routedComponent();

    this.logger.debug('Updating Page Header Dynamic Content', component);

    if (isRoutableViewModel(component)) {
      this.search = component.getSearch.apply(component);
    }
    else {
      this.search = undefined;
    }

    // dispose any existing subscriptions to header actions
    this.dynamicSubs.dispose();

    // add our header actions
    this.addItems(this.sidebarMenus, this.staticSidebarMenus, component, x => x.getSidebarMenus);
    this.addItems(this.navbarMenus, this.staticNavbarMenus, component, x => x.getNavbarMenus);
    this.addItems(this.navbarActions, this.staticNavbarActions, component, x => x.getNavbarActions);
    this.addItems(this.helpMenuItems, this.staticHelpMenuItems, component, x => x.getHelpMenuItems);
    this.addItems(this.adminMenuItems, this.staticAdminMenuItems, component, x => x.getAdminMenuItems);
    this.addItems(this.userMenuItems, this.staticUserMenuItems, component, x => x.getUserMenuItems);
  }

  private addItems<T extends HeaderAction>(list: wx.IObservableProperty<T[]>, staticItems: T[], component?: any, delegateSelector?: (viewModel: BaseRoutableViewModel<any>) => (() => T[])) {
    let routedItems: T[] | undefined;

    // interrogate the routed component for items from the delegate selector
    if (delegateSelector != null && isRoutableViewModel(component)) {
      let selector = delegateSelector(component);
      if (selector != null) {
        routedItems = <T[]>selector.apply(component);
      }
    }

    list(
      // start with all the static items
      staticItems
        // then add any routed actions
        .concat(routedItems || [])
        // finally sort the list so that we retain a consistent order
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    );

    // now that our list is populated with our header actions, subscribe to the
    // canExecute observable to manage the disabled status of any header action
    list()
      .map((x: HeaderAction) => isHeaderCommandAction(x) ? x : undefined)
      .filter(x => x != null)
      .map(x => x!)
      .forEach(action => {
        this.dynamicSubs.add(
          action.command!.canExecuteObservable
            .distinctUntilChanged()
            .subscribe(x => {
              this.notifyChanged();
            }),
        );
      });
  }
}
