'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../../React/BaseViewModel';
import { IAction, IMenu, IMenuItem } from './Actions';
import SearchViewModel from '../Search/SearchViewModel';

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  constructor(
    public appSwitcherMenuItems: IMenuItem[] = [],
    public appMenus: IMenu[] = [],
    public appActions: IAction[] = [],
    public search?: SearchViewModel,
    public helpMenuItems: IMenuItem[] = [],
    public adminMenuItems: IMenuItem[] = [],
    public userMenuItems: IMenuItem[] = [],
    public userImage?: string,
    public homeLink = '#/') {
    super();
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
