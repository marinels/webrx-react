import { Command, isCommand } from '../../WebRx';

export interface HeaderAction {
  id: any;
  header: any;
  order?: number;
}

export interface HeaderCommandAction extends HeaderAction {
  command?: Command;
  commandParameter?: any;
  visibleWhenDisabled?: boolean;
  iconName?: string | string[];
  bsStyle?: string;
  uri?: string;
}

export interface HeaderMenu extends HeaderAction {
  items: HeaderCommandAction[];
}

export function isHeaderCommandAction(
  action: HeaderAction,
): action is HeaderCommandAction {
  return isCommand((action as HeaderCommandAction).command);
}

export function isHeaderMenu(action: HeaderAction): action is HeaderMenu {
  return Array.isArray((action as HeaderMenu).items);
}
