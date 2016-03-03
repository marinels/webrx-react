'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from './BaseViewModel';
import PubSub from '../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../Events/RoutingStateChanged';
import { ICommandAction, IMenu, IMenuItem } from '../Common/PageHeader/Actions';

export interface IBaseRoutableViewModel extends IBaseViewModel {
  getRoutingKey(): string;

  // for dynamic page header content
  getAppSwitcherMenuItems?: () => IMenuItem[];
  getAppMenus?: () => IMenu[];
  getAppActions?: () => ICommandAction[];
  getHelpMenuItems?: () => IMenuItem[];
  getAdminMenuItems?: () => IMenuItem[];
  getUserMenuItems?: () => IMenuItem[];
}

export interface IRoutableViewModel<TRoutingState> extends IBaseRoutableViewModel {
  getRoutingState(context?: any): TRoutingState;
  setRoutingState(state: TRoutingState): void;
}

export interface IRoutedViewModel extends IBaseRoutableViewModel {
  getRoutingState(context?: any): any;
  setRoutingState(state: any): void;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel implements IRoutableViewModel<TRoutingState> {
  public static displayName = 'BaseRoutableViewModel';

  constructor(public isRoutingEnabled = false) {
    super();
  }

  public routingStateChanged = wx.command(x => {
    if (this.isRoutingEnabled) {
      PubSub.publish<IRoutingStateChanged>(RoutingStateChangedKey, x);
    }
  });

  protected createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      initializer(initialState);
    }

    return initialState;
  }

  protected handleRoutingState(state = {} as TRoutingState, handler: (state: TRoutingState) => void, ...observables: Rx.Observable<any>[]) {
    if (this.isRoutingEnabled && handler != null) {
      let sub: Rx.IDisposable;

      if (observables.length > 0) {
        sub = Rx.Observable
          .combineLatest(observables, () => null)
          .take(1)
          .invokeCommand(this.stateChanged);
      }

      handler(state);

      Object.dispose(sub);
    }
  }

  public getRoutingKey() { return Object.getName(this); }

  public getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      this.saveRoutingState(state);
    });
  }

  protected saveRoutingState(state: TRoutingState) {
  }

  public setRoutingState(state: TRoutingState) {
    this.handleRoutingState(state, state => {
      this.loadRoutingState(state);
    });
  }

  protected loadRoutingState(state: TRoutingState) {
  }
}

export default BaseRoutableViewModel;
