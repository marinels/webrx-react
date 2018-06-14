import { ReadOnlyProperty, Command } from '../../WebRx';
import { BaseViewModel } from './BaseViewModel';
import { HeaderCommandAction, HeaderMenu } from './Actions';
import { HandlerRoutingStateChanged, RoutingStateHandler, Search } from './Interfaces';

export function isRoutableViewModel(value: any): value is BaseRoutableViewModel<any> {
  if (value == null) {
    return false;
  }

  const viewModel: BaseRoutableViewModel<any> = value;

  return (
    viewModel.isRoutableViewModel instanceof Function &&
    viewModel.isRoutableViewModel()
  );
}

export interface RoutingBreadcrumb {
  key: any;
  content: string;
  href?: string;
  target?: string;
  title?: string;
  tooltip?: any;
}

export abstract class BaseRoutableViewModel<T> extends BaseViewModel implements RoutingStateHandler<T> {
  public static displayName = 'BaseRoutableViewModel';

  protected readonly updateDocumentTitle: Command<string>;
  protected readonly updateRoutingBreadcrumbs: Command<Array<RoutingBreadcrumb> | undefined>;

  public readonly documentTitle: ReadOnlyProperty<string>;
  public readonly breadcrumbs: ReadOnlyProperty<Array<RoutingBreadcrumb> | undefined>;

  constructor() {
    super();

    this.updateDocumentTitle = this.wx.command((title: any) => (title || '').toString());
    this.updateRoutingBreadcrumbs = this.wx.command<Array<RoutingBreadcrumb> | undefined>();

    this.documentTitle = this.updateDocumentTitle.results.toProperty();
    this.breadcrumbs = this.wx
      .whenAny(this.updateRoutingBreadcrumbs.results, x => x)
      .toProperty();
  }

  isRoutingStateHandler() {
    return true;
  }

  public abstract createRoutingState(changed: HandlerRoutingStateChanged): T;
  public abstract applyRoutingState(state: T): void;

  public isRoutableViewModel() {
    return true;
  }

  // -------------------------------------------------------
  // These are overridable dynamic routing content functions
  // -------------------------------------------------------
  public getRoutingKey() {
    return Object.getName(this);
  }

  public getSearch(): Search | undefined {
    return undefined;
  }

  public getSidebarMenus(): Array<HeaderMenu> {
    return [];
  }

  public getNavbarMenus(): Array<HeaderMenu> {
    return [];
  }

  public getNavbarActions(): Array<HeaderCommandAction> {
    return [];
  }

  public getHelpMenuItems(): Array<HeaderCommandAction> {
    return [];
  }

  public getAdminMenuItems(): Array<HeaderCommandAction> {
    return [];
  }

  public getUserMenuItems(): Array<HeaderCommandAction> {
    return [];
  }
  // -------------------------------------------------------
}
