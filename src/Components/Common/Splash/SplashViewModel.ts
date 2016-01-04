'use strict';

import * as wx from 'webrx';

import BaseRoutableViewModel from '../../React/BaseRoutableViewModel';

export class SplashViewModel extends BaseRoutableViewModel<any> {
  public static displayName = 'SplashViewModel';

  constructor(text = 'Loading...', value = 100) {
    super(false);

    this.text = wx.property(text);
    this.value = wx.property(value);
  }

  public text: wx.IObservableProperty<string>;
  public value: wx.IObservableProperty<number>;

  getRoutingState(context?: any) {
    return this.createRoutingState(state => null);
  }

  setRoutingState(state: any) {
  }
};

export default SplashViewModel;
