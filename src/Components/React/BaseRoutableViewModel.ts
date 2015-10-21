'use strict';

import * as wx from 'webrx';

import { BaseViewModel, IBaseViewModel } from './BaseViewModel';

export interface IRoutableViewModel<TRoutingState> extends IBaseViewModel {
  routingState: wx.IObservableProperty<TRoutingState>;

  getRoutingState(): TRoutingState;
  setRoutingState(state: TRoutingState): void;
}

export interface IRoutedViewModel extends IBaseViewModel {
  key: string;

  getRoutingState(): Object;
  setRoutingState(state: Object): void;
}

export abstract class BaseRoutableViewModel<TRoutingState> extends BaseViewModel implements IRoutableViewModel<TRoutingState> {
  public routingState: wx.IObservableProperty<TRoutingState>;

  public abstract getRoutingState(): TRoutingState;
  public abstract setRoutingState(state: TRoutingState): void;
}

export default BaseRoutableViewModel;
