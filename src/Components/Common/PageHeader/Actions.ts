export interface HeaderAction {
  id: any;
  header: any;
  order?: number;
}

export interface HeaderCommandAction extends HeaderAction {
  command: wx.ICommand<any>;
  commandParameter?: any;
  iconName?: string;
  bsStyle?: string;
}

export interface HeaderMenu extends HeaderAction {
  items: HeaderMenuItem[];
}

export interface HeaderMenuItem extends HeaderAction {
  command?: wx.ICommand<any>;
  commandParameter?: any;
  iconName?: string;
  uri?: string;
}
