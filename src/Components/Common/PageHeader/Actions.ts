'use strict';

export interface IAction {
  id: any;
  order?: number;
  header: any;
  command: wx.ICommand<any>;
}

export interface IMenu {
  id: any;
  order?: number;
  header: any;
  items: IMenuItem[];
}

export interface IMenuItem {
  id: any;
  order?: number;
  title: string;
  iconName?: string;
  uri?: string;
  command?: wx.ICommand<any>
}
