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
  public abstract getRoutingState(): TRoutingState;
  public abstract setRoutingState(state: TRoutingState): void;

  public getRoutingKey() { return Object.getName(this); }

  protected routingStateChanged(...args: any[]) {
    PubSub.publish(Events.RoutingStateChanged, args);
  }
}

export default BaseRoutableViewModel;
