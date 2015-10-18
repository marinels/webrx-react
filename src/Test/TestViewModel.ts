'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class TestViewModel extends BaseViewModel {
  public firstName = wx.property('');
  public lastName = wx.property('');
  public displayName: wx.IObservableProperty<string>;

  public initialize() {
    this.displayName = wx.whenAny(this.firstName, this.lastName, (firstName, lastName) => {
      return firstName + ' ' + lastName;
    }).toProperty();
  }
}

export default TestViewModel;
