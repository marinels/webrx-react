'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export interface IMenuItem {
  title: string;
  uri: string;
  glyph?: string;
  // items?: IMenuItem[]
}

export class PageHeaderViewModel extends BaseViewModel {
  constructor(menuItems?: IMenuItem[]) {
    super();

    this.menuItems = Object.getValueOrDefault(menuItems, []);
  }

  public menuItems: IMenuItem[];
  public menuItemSelected = wx.command(x => {
    this.navTo(x as string);
  });
}

export default PageHeaderViewModel;
