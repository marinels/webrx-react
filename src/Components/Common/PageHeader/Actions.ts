export interface IBaseAction {
  id: any;
  header: any;
  order?: number;
}

export interface ICommandAction extends IBaseAction {
  command: wx.ICommand<any>;
  commandParameter?: any;
  iconName?: string;
  bsStyle?: string;
}

export interface IMenu extends IBaseAction {
  items: IMenuItem[];
}

export interface IMenuItem extends IBaseAction {
  command?: wx.ICommand<any>;
  commandParameter?: any;
  iconName?: string;
  uri?: string;
}
