'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';
import { IBaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { IBaseAction, ICommandAction, IMenu, IMenuItem } from './Actions';
import RouteHandlerViewModel from '../RouteHandler/RouteHandlerViewModel';
import SearchViewModel from '../Search/SearchViewModel';

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  constructor(
    public routeHandler?: RouteHandlerViewModel,
    public search?: SearchViewModel,
    public staticAppSwitcherMenuItems: IMenuItem[] = [],
    public staticAppMenus: IMenu[] = [],
    public staticAppActions: ICommandAction[] = [],
    public staticHelpMenuItems: IMenuItem[] = [],
    public staticAdminMenuItems: IMenuItem[] = [],
    public staticUserMenuItems: IMenuItem[] = [],
    public userImage?: string,
    public userDisplayName?: string,
    public homeLink = '#/') {
    super();
  }

  public appSwitcherMenuItems = wx.list<IMenuItem>();
  public appMenus = wx.list<IMenu>();
  public appActions = wx.list<ICommandAction>();
  public helpMenuItems = wx.list<IMenuItem>();
  public adminMenuItems = wx.list<IMenuItem>();
  public userMenuItems = wx.list<IMenuItem>();

  initialize() {
    if (this.routeHandler != null) {
      this.subscribe(
        wx
          .whenAny(this.routeHandler.currentViewModel, x => x)
          .subscribe(x => {
            this.addDynamicContent(x);
          })
      );
    }
  }

  private addDynamicContent(viewModel?: IBaseRoutableViewModel) {
    this.addItems(this.appSwitcherMenuItems, this.staticAppSwitcherMenuItems, viewModel, x => x.getAppSwitcherMenuItems);
    this.addItems(this.appMenus, this.staticAppMenus, viewModel, x => x.getAppMenus);
    this.addItems(this.appActions, this.staticAppActions, viewModel, x => x.getAppActions);
    this.addItems(this.helpMenuItems, this.staticHelpMenuItems, viewModel, x => x.getHelpMenuItems);
    this.addItems(this.adminMenuItems, this.staticAdminMenuItems, viewModel, x => x.getAdminMenuItems);
    this.addItems(this.userMenuItems, this.staticUserMenuItems, viewModel, x => x.getUserMenuItems);
  }

  private addItems<T extends IBaseAction>(list: wx.IObservableList<T>, staticItems: T[], viewModel?: IBaseRoutableViewModel, delegateSelector?: (viewModel: IBaseRoutableViewModel) => (() => T[])) {
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
  }

  public menuItemSelected = wx.command((x: IMenuItem) => {
    if (x != null) {
      if (x.command != null) {
        x.command.execute(x);
      } else if (x.uri != null && x.uri.length > 0) {
        if (x.uri[0] === '#') {
          this.navTo(x.uri);
        } else {
          window.location.href = x.uri;
        }
      }
    }
  });
}

export default PageHeaderViewModel;
