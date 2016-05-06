'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';
import { IBaseRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { IBaseAction, ICommandAction, IMenu, IMenuItem } from './Actions';
import RouteHandlerViewModel from '../RouteHandler/RouteHandlerViewModel';
import SearchViewModel from '../Search/SearchViewModel';
import SubMan from '../../../Utils/SubMan';

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  private dynamicSubs = new SubMan();

  public search: SearchViewModel = null;
  public appSwitcherMenuItems = wx.list<IMenuItem>();
  public appMenus = wx.list<IMenu>();
  public appActions = wx.list<ICommandAction>();
  public helpMenuItems = wx.list<IMenuItem>();
  public adminMenuItems = wx.list<IMenuItem>();
  public userMenuItems = wx.list<IMenuItem>();

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

  constructor(
    public routeHandler?: RouteHandlerViewModel,
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

  initialize() {
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

    if (viewModel != null && viewModel.componentRouted != null) {
      viewModel.componentRouted.apply(viewModel, [ this ]);
    }

    this.search = (viewModel == null || viewModel.getSearch == null) ? null : viewModel.getSearch.apply(viewModel);

    this.dynamicSubs.dispose();

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

    list.forEach((x: any) => {
      if (x.command != null && x.command.canExecuteObservable) {
        const canExecute = <Rx.Observable<boolean>>x.command.canExecuteObservable;

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

export default PageHeaderViewModel;
