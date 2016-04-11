'use strict';

export interface IBaseAction {
  id: any;
  order?: number;
  header: any;
}

export interface ICommandAction extends IBaseAction {
  command: wx.ICommand<any>;
  commandParameter?: any;
  iconName?: string;
}

export interface IMenu extends IBaseAction {
  items: IMenuItem[];
}

export interface IMenuItem extends IBaseAction {
  iconName?: string;
  uri?: string;
  command?: wx.ICommand<any>;
  commandParameter?: any;
}
