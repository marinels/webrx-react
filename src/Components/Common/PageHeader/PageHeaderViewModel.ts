import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { HeaderAction, HeaderCommandAction, HeaderMenu, HeaderMenuItem } from './Actions';
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
  public helpMenuItems: wx.IObservableList<HeaderMenuItem>;
  public adminMenuItems: wx.IObservableList<HeaderMenuItem>;
  public userMenuItems: wx.IObservableList<HeaderMenuItem>;
  public isSidebarVisible: wx.IObservableReadOnlyProperty<boolean>;

  public menuItemSelected: wx.ICommand<HeaderMenuItem>;
  public toggleSideBar: wx.ICommand<boolean>;

  constructor(
    public routeHandler?: RouteHandlerViewModel,
    public staticSidebarMenus: HeaderMenu[] = [],
    public staticNavbarMenus: HeaderMenu[] = [],
    public staticNavbarActions: HeaderCommandAction[] = [],
    public staticHelpMenuItems: HeaderMenuItem[] = [],
    public staticAdminMenuItems: HeaderMenuItem[] = [],
    public staticUserMenuItems: HeaderMenuItem[] = [],
    public userImage?: string,
    public userDisplayName?: string,
    public homeLink = '#/'
  ) {
    super();

    this.dynamicSubs = new SubMan();

    this.sidebarMenus = wx.list<HeaderMenu>();
    this.navbarMenus = wx.list<HeaderMenu>();
    this.navbarActions = wx.list<HeaderCommandAction>();
    this.helpMenuItems = wx.list<HeaderMenuItem>();
    this.adminMenuItems = wx.list<HeaderMenuItem>();
    this.userMenuItems = wx.list<HeaderMenuItem>();

    this.toggleSideBar = wx.asyncCommand((isVisible: boolean) =>
      Observable.of(Object.fallback(isVisible, !this.isSidebarVisible()))
    );

    this.isSidebarVisible = wx
      .whenAny(this.toggleSideBar.results, x => x)
      .toProperty(false);

    this.menuItemSelected = wx.asyncCommand((x: HeaderMenuItem) => Observable.of(x));

    this.subscribe(
      wx
        .whenAny(this.menuItemSelected.results, x => x)
        .filter(x => x != null)
        .map(x => false)
        .invokeCommand(this.toggleSideBar)
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
      }
    );

    if (this.routeHandler != null) {
      this.subscribe(
        wx
          .whenAny(this.routeHandler.currentViewModel, x => x)
          .subscribe(x => {
            this.updateDynamicContent();
          })
      );
    }
  }

  public updateDynamicContent() {
    let viewModel = this.routeHandler.currentViewModel();

    this.logger.debug('Updating Page Header Dynamic Content', viewModel);

    this.search = (viewModel == null || viewModel.getSearch == null) ? null : viewModel.getSearch.apply(viewModel);

    this.dynamicSubs.dispose();

    this.addItems(this.sidebarMenus, this.staticSidebarMenus, viewModel, x => x.getSidebarMenus);
    this.addItems(this.navbarMenus, this.staticNavbarMenus, viewModel, x => x.getNavbarMenus);
    this.addItems(this.navbarActions, this.staticNavbarActions, viewModel, x => x.getNavbarActions);
    this.addItems(this.helpMenuItems, this.staticHelpMenuItems, viewModel, x => x.getHelpMenuItems);
    this.addItems(this.adminMenuItems, this.staticAdminMenuItems, viewModel, x => x.getAdminMenuItems);
    this.addItems(this.userMenuItems, this.staticUserMenuItems, viewModel, x => x.getUserMenuItems);
  }

  private addItems<T extends HeaderAction>(list: wx.IObservableList<T>, staticItems: T[], viewModel?: BaseRoutableViewModel<any>, delegateSelector?: (viewModel: BaseRoutableViewModel<any>) => (() => T[])) {
    wx.using(list.suppressChangeNotifications(), () => {
      list.clear();
      list.addRange(staticItems);

      if (viewModel != null && delegateSelector != null) {
        let selector = delegateSelector(viewModel);
        if (selector != null) {
          list.addRange(selector.apply(viewModel) as T[]);
        }
      }

      list.sort((a, b) => (a.order || 0) - (b.order || 0));
    });

    list.forEach((x: any) => {
      if (x.command != null && x.command.canExecuteObservable) {
        const canExecute = <Observable<boolean>>x.command.canExecuteObservable;

        this.dynamicSubs.add(canExecute
          .distinctUntilChanged()
          .subscribe(y => {
            this.notifyChanged();
          })
        );
      }
    });
  }
}
