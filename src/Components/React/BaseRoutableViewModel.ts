import * as wx from 'webrx';

import { BaseViewModel } from './BaseViewModel';
import { Default as pubSub } from '../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../Events/RoutingStateChanged';
import { ICommandAction, IMenu, IMenuItem } from '../Common/PageHeader/Actions';

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel {
  public static displayName = 'BaseRoutableViewModel';

  protected routingState = wx.property<TRoutingState>();

  public routingStateChanged = wx.command(x => {
    this.notifyRoutingStateChanged(x);
  });

  constructor(public isRoutingEnabled = false) {
    super();
  }

  protected notifyRoutingStateChanged(context?: any) {
    if (this.isRoutingEnabled) {
      pubSub.publish<IRoutingStateChanged>(RoutingStateChangedKey, context);
    }
  }

  private createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      initializer(initialState);
    }

    return initialState;
  }

  private handleRoutingState(state = {} as TRoutingState, handler: (state: TRoutingState) => void, ...observables: Rx.Observable<any>[]) {
    if (this.isRoutingEnabled && handler != null) {
      let sub: Rx.IDisposable;

      // if any observables are passed in then we watch them for any changes
      // if any changes are detected we invoke a stateChanged (i.e. force a render)
      // this allows an observable that doesn't normally drive rendering to invoke a render
      if (observables.length > 0) {
        sub = Rx.Observable
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

  /**
   * Get the current routing state
   */
  public getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      this.saveRoutingState(state);
    });
  }

  /**
   * Apply a new routing state
   */
  public setRoutingState(state: TRoutingState, ...observables: Rx.Observable<any>[]) {
    this.routingState(null);

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

  public getTitle() {
    this.logger.warn(`${Object.getName(this)} does not provide a custom routed browser title`);

    return Object.getName(this);
  }

  public getSearch() {
    return <any>null;
  }

  public getAppSwitcherMenuItems() {
    return <IMenuItem[]>[];
  }

  public getAppMenus() {
    return <IMenu[]>[];
  }

  public getAppActions() {
    return <ICommandAction[]>[];
  }

  public getHelpMenuItems() {
    return <IMenuItem[]>[];
  }

  public getAdminMenuItems() {
    return <IMenuItem[]>[];
  }

  public getUserMenuItems() {
    return <IMenuItem[]>[];
  }
  // -------------------------------------------------------
}
