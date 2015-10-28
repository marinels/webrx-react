'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from './BaseViewModel';
import PubSub from '../../Utils/PubSub';
import Events from '../../Events';

export interface IKeyedRoutableViewModel extends IBaseViewModel {
  getRoutingKey(): string;
}

export interface IRoutableViewModel<TRoutingState> extends IKeyedRoutableViewModel {
  getRoutingState(): TRoutingState;
  setRoutingState(state: TRoutingState): void;
}

export interface IRoutedViewModel extends IKeyedRoutableViewModel {
  getRoutingState(): Object;
  setRoutingState(state: Object): void;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel implements IRoutableViewModel<TRoutingState> {
  constructor(public isRoutingEnabled = false) {
    super();
  }

  public abstract getRoutingState(): TRoutingState;
  public abstract setRoutingState(state: TRoutingState): void;

  public getRoutingKey() { return Object.getName(this); }

  protected createRoutingState(initializer: (state: TRoutingState) => void, initialState = {} as TRoutingState) {
    if (this.isRoutingEnabled === true && initializer != null) {
      initializer(initialState);
    }

    return initialState;
  }

  protected routingStateChanged(...args: any[]) {
    if (this.isRoutingEnabled) {
      PubSub.publish(Events.RoutingStateChanged, args);
    }
  }
}

export default BaseRoutableViewModel;
