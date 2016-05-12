'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from './BaseViewModel';
import PubSub from '../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../Events/RoutingStateChanged';
import { ICommandAction, IMenu, IMenuItem } from '../Common/PageHeader/Actions';

export interface IBaseRoutableViewModel extends IBaseViewModel {
  // NOTE: componentRouted and getSearch need typeless arguments due to circular dependencies
  componentRouted?: (pageHeader?: any) => void;
  getSearch?: () => any;

  getAppSwitcherMenuItems?: () => IMenuItem[];
  getAppMenus?: () => IMenu[];
  getAppActions?: () => ICommandAction[];
  getHelpMenuItems?: () => IMenuItem[];
  getAdminMenuItems?: () => IMenuItem[];
  getUserMenuItems?: () => IMenuItem[];

  getRoutingKey(): string;
  getTitle(): string;
}

export interface IRoutableViewModel<TRoutingState> extends IBaseRoutableViewModel {
  getRoutingState(context?: any): TRoutingState;
  setRoutingState(state: TRoutingState): void;
}

export interface IRoutedViewModel extends IBaseRoutableViewModel {
  getRoutingState(context?: any): any;
  setRoutingState(state: any): void;
  getTitle(): string;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel implements IRoutableViewModel<TRoutingState> {
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
      PubSub.publish<IRoutingStateChanged>(RoutingStateChangedKey, context);
    }
  }

  protected createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      initializer(initialState);
    }

    return initialState;
  }

  protected handleRoutingState(state = {} as TRoutingState, handler: (state: TRoutingState) => void, ...observables: Rx.Observable<any>[]) {
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

  public getRoutingKey() { return Object.getName(this); }

  public getTitle() {
    this.logger.warn(`${Object.getName(this)} does not provide a custom routed browser title`);

    return Object.getName(this);
  }

  public getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      this.saveRoutingState(state);
    });
  }

  protected saveRoutingState(state: TRoutingState) {
    // do nothing by default
  }

  public setRoutingState(state: TRoutingState, ...observables: Rx.Observable<any>[]) {
    this.routingState(null);

    this.handleRoutingState(state, x => {
      this.loadRoutingState(x);
    }, ...observables);
  }

  protected loadRoutingState(state: TRoutingState) {
    this.routingState(state);
  }
}

export default BaseRoutableViewModel;
