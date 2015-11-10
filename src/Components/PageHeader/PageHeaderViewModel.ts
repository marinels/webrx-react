'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export interface IMenuItem {
  id: any;
  title: string;
  glyph?: string;
  uri?: string;
  command?: wx.ICommand<any>
}

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  constructor(public appSwitcherMenuItems: IMenuItem[] = [], public adminMenuItems: IMenuItem[] = [], public userMenuItems: IMenuItem[] = [], public userImage?: string) {
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
