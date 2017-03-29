import { Observable, IDisposable } from 'rx';

import { wx } from '../../WebRx';
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
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel {
  public static displayName = 'BaseRoutableViewModel';

  protected routingState: wx.IObservableProperty<TRoutingState>;
  protected updateDocumentTitle: wx.ICommand<string>;
  protected updateRoutingBreadcrumbs: wx.ICommand<RoutingBreadcrumb[] | undefined>;

  public routingStateChanged: wx.ICommand<any>;
  public documentTitle: wx.IObservableReadOnlyProperty<string>;
  public breadcrumbs: wx.IObservableReadOnlyProperty<RoutingBreadcrumb[] | undefined>;

  constructor(public isRoutingEnabled = false, routingStateRateLimit = 25) {
    super();

    this.routingState = wx.property<TRoutingState>();
    this.updateDocumentTitle = wx.asyncCommand((title: any) => Observable.of(title.toString()));
    this.updateRoutingBreadcrumbs = wx.asyncCommand((x: RoutingBreadcrumb[] | undefined) => Observable.of(x));

    this.routingStateChanged = wx.command();
    this.documentTitle = this.updateDocumentTitle.results.toProperty();
    this.breadcrumbs = wx
      .whenAny(this.updateRoutingBreadcrumbs.results, x => x)
      .toProperty();

    this.subscribe(
      this.routingStateChanged.results
        .filter(x => this.isRoutingEnabled)
        .debounce(routingStateRateLimit)
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

  private handleRoutingState(state = {} as TRoutingState, handler: (state: TRoutingState) => void, ...observables: Observable<any>[]) {
    if (this.isRoutingEnabled && handler != null) {
      let sub: IDisposable | undefined;

      // if any observables are passed in then we watch them for any changes
      // if any changes are detected we invoke a stateChanged (i.e. force a render)
      // this allows an observable that doesn't normally drive rendering to invoke a render
      if (observables.length > 0) {
        sub = Observable
          .combineLatest(observables, () => null)
          .take(1)
          .invokeCommand(this.stateChanged);
      }

      handler(state);

      // don't listen to the observables after we have finished handling the routing state
      Object.dispose(sub);
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
  public setRoutingState(state: TRoutingState, ...observables: Observable<any>[]) {
    this.handleRoutingState(state, x => {
      this.loadRoutingState(x);

      this.routingState(state);
    }, ...observables);

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
