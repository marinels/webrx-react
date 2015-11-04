'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from './BaseViewModel';
import PubSub from '../../Utils/PubSub';
import { RoutingStateChangedKey, IRoutingStateChanged } from '../../Events/RoutingStateChanged';

export interface IKeyedRoutableViewModel extends IBaseViewModel {
  getRoutingKey(): string;
}

export interface IRoutableViewModel<TRoutingState> extends IKeyedRoutableViewModel {
  getRoutingState(context?: any): TRoutingState;
  setRoutingState(state: TRoutingState): void;
}

export interface IRoutedViewModel extends IKeyedRoutableViewModel {
  getRoutingState(context?: any): Object;
  setRoutingState(state: Object): void;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel implements IRoutableViewModel<TRoutingState> {
  constructor(public isRoutingEnabled = false) {
    super();
  }

  protected createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      initializer(initialState);
    }

    return initialState;
  }

  protected routingStateChanged(context?: any) {
    if (this.isRoutingEnabled) {
      PubSub.publish<IRoutingStateChanged>(RoutingStateChangedKey, { context });
    }
  }

  public getRoutingKey() { return Object.getName(this); }

  public abstract getRoutingState(context?: any): TRoutingState;
  public abstract setRoutingState(state: TRoutingState): void;
}

export default BaseRoutableViewModel;
