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

  public search: SearchViewModel = null;
  public sidebarMenus: wx.IObservableList<HeaderMenu>;
  public navbarMenus: wx.IObservableList<HeaderMenu>;
  public navbarActions: wx.IObservableList<HeaderCommandAction>;
  public helpMenuItems: wx.IObservableList<HeaderCommandAction>;
  public adminMenuItems: wx.IObservableList<HeaderCommandAction>;
  public userMenuItems: wx.IObservableList<HeaderCommandAction>;
  public isSidebarVisible: wx.IObservableReadOnlyProperty<boolean>;

  public menuItemSelected: wx.ICommand<HeaderCommandAction>;
  public toggleSideBar: wx.ICommand<boolean>;

  constructor(
    public routeHandler?: RouteHandlerViewModel,
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

    this.sidebarMenus = wx.list<HeaderMenu>();
    this.navbarMenus = wx.list<HeaderMenu>();
    this.navbarActions = wx.list<HeaderCommandAction>();
    this.helpMenuItems = wx.list<HeaderCommandAction>();
    this.adminMenuItems = wx.list<HeaderCommandAction>();
    this.userMenuItems = wx.list<HeaderCommandAction>();

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

    if (this.routeHandler != null) {
      this.subscribe(
        wx
          .whenAny(this.routeHandler.routedComponent, x => x)
          .subscribe(x => {
            this.updateDynamicContent();
          }),
      );
    }
  }

  public updateDynamicContent() {
    let component = this.routeHandler.routedComponent();

    this.logger.debug('Updating Page Header Dynamic Content', component);

    if (isRoutableViewModel(component)) {
      this.search = component.getSearch.apply(component);
    }
    else {
      this.search = null;
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

  private addItems<T extends HeaderAction>(list: wx.IObservableList<T>, staticItems: T[], component?: any, delegateSelector?: (viewModel: BaseRoutableViewModel<any>) => (() => T[])) {
    wx.using(list.suppressChangeNotifications(), () => {
      // start by clearing the action list
      list.clear();
      // then add all the static items
      list.addRange(staticItems);

      // then attempt to add any routed actions to the list
      if (delegateSelector != null && isRoutableViewModel(component)) {
        let selector = delegateSelector(component);
        if (selector != null) {
          list.addRange(selector.apply(component) as T[]);
        }
      }

      // finally sort the list so that we retain a consistent order
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    // now that our list is populated with our header actions, subscribe to the
    // canExecute observable to manage the disabled status of any header action
    list.forEach((action: HeaderAction) => {
      if (isHeaderCommandAction(action)) {
        this.dynamicSubs.add(
          action.command.canExecuteObservable
            .distinctUntilChanged()
            .subscribe(x => {
              this.notifyChanged();
            }),
        );
      }
    });
  }
}
