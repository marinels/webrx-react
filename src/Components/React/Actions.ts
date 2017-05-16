import { wx, Command } from '../../WebRx';

export interface HeaderAction {
  id: any;
  header: any;
  order?: number;
}

export interface HeaderCommandAction extends HeaderAction {
  command?: Command<any>;
  commandParameter?: any;
  visibleWhenDisabled?: boolean;
  iconName?: string | string[];
  bsStyle?: string;
  uri?: string;
}

export interface HeaderMenu extends HeaderAction {
  items: HeaderCommandAction[];
}

export function isHeaderCommandAction(action: HeaderAction): action is HeaderCommandAction {
  return wx.isCommand((<HeaderCommandAction>action).command);
}

export function isHeaderMenu(action: HeaderAction): action is HeaderMenu {
  return Array.isArray((<HeaderMenu>action).items);
}
