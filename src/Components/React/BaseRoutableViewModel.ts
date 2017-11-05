import { Observable } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../WebRx';
import { BaseViewModel } from './BaseViewModel';
import { HeaderCommandAction, HeaderMenu } from './Actions';
import { Default as pubSub } from '../../Utils/PubSub';
import { RoutingStateChangedKey, RoutingStateChanged } from '../../Events/RoutingStateChanged';

export function isRoutableViewModel(source: any): source is BaseRoutableViewModel<any> {
  const viewModel = <BaseRoutableViewModel<any>>source;

  if (viewModel != null && viewModel.isRoutableViewModel instanceof Function) {
    return viewModel.isRoutableViewModel();
  }
  else {
    return false;
  }
}

export interface RoutingBreadcrumb {
  key: any;
  content: string;
  href: string;
  target?: string;
  title?: string;
  tooltip?: any;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel {
  public static displayName = 'BaseRoutableViewModel';

  protected readonly routingState: Property<TRoutingState>;
  protected readonly updateDocumentTitle: Command<string>;
  protected readonly updateRoutingBreadcrumbs: Command<RoutingBreadcrumb[] | undefined>;

  public readonly routingStateChanged: Command<any>;
  public readonly documentTitle: ReadOnlyProperty<string>;
  public readonly breadcrumbs: ReadOnlyProperty<RoutingBreadcrumb[] | undefined>;

  constructor(public isRoutingEnabled = false, routingStateRateLimit = 25) {
    super();

    this.routingState = this.wx.property<TRoutingState>();
    this.updateDocumentTitle = this.wx.command((title: any) => title.toString());
    this.updateRoutingBreadcrumbs = this.wx.command<RoutingBreadcrumb[] | undefined>();

    this.routingStateChanged = this.wx.command();
    this.documentTitle = this.updateDocumentTitle.results.toProperty();
    this.breadcrumbs = this.wx
      .whenAny(this.updateRoutingBreadcrumbs.results, x => x)
      .toProperty();

    this.addSubscription(
      this.routingStateChanged.results
        .filter(() => this.isRoutingEnabled)
        .debounceTime(routingStateRateLimit)
        .subscribe(x => {
          pubSub.publish<RoutingStateChanged>(RoutingStateChangedKey, x);
        }),
    );
  }

  protected notifyRoutingStateChanged(context?: any) {
    if (this.isRoutingEnabled) {
      this.routingStateChanged.execute(context);
    }
  }

  private createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      return initializer(initialState) || initialState;
    }

    return initialState;
  }

  private handleRoutingState(state = {} as TRoutingState, handler: (state: TRoutingState) => void) {
    if (this.isRoutingEnabled && handler != null) {
      handler(state);
    }
  }

  // -------------------------------------------------------
  // These are overridable routing state functions
  // -------------------------------------------------------
  protected saveRoutingState(state: TRoutingState) {
    // do nothing by default
  }

  protected loadRoutingState(state: TRoutingState) {
    // do nothing by default
  }
  // -------------------------------------------------------

  // -------------------------------------------------------
  // These are overridable routing lifecycle functions
  // -------------------------------------------------------
  protected routed() {
    // do nothing
  }
  // -------------------------------------------------------

  public isRoutableViewModel() {
    return true;
  }

  /**
   * Get the current routing state
   */
  public getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      return this.saveRoutingState(state) || state;
    });
  }

  /**
   * Apply a new routing state
   */
  public setRoutingState(state: TRoutingState) {
    this.handleRoutingState(state, x => {
      this.loadRoutingState(x);

      this.routingState.value = state;
    });

    this.routed();
  }

  // -------------------------------------------------------
  // These are overridable dynamic routing content functions
  // -------------------------------------------------------
  public getRoutingKey() {
    return Object.getName(this);
  }

  public getSearch() {
    return <any>null;
  }

  public getSidebarMenus() {
    return <HeaderMenu[]>[];
  }

  public getNavbarMenus() {
    return <HeaderMenu[]>[];
  }

  public getNavbarActions() {
    return <HeaderCommandAction[]>[];
  }

  public getHelpMenuItems() {
    return <HeaderCommandAction[]>[];
  }

  public getAdminMenuItems() {
    return <HeaderCommandAction[]>[];
  }

  public getUserMenuItems() {
    return <HeaderCommandAction[]>[];
  }
  // -------------------------------------------------------
}
