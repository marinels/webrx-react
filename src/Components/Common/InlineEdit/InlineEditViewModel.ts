'use strict';

import * as wx from 'webrx';
import { BaseViewModel } from '../../React/BaseViewModel';

export class InlineEditViewModel extends BaseViewModel {
  public static displayName = 'InlineEditViewModel';

  public val: wx.IObservableProperty<number>;
  public changeMode: wx.ICommand<any>;
  public update: wx.ICommand<any>;
  public isInEditMode: wx.IObservableProperty<boolean>;

  constructor(val: wx.IObservableProperty<any>) {
    super();

    this.isInEditMode = wx.property(false);
    this.val = val;

    this.changeMode = wx.command(() => {
      this.isInEditMode(true);
    });

    this.update = wx.command((callBackFn) => {
      if (callBackFn instanceof Function) {
        callBackFn(this.val());
      }
      this.isInEditMode(false);
    });
  }
}

export default InlineEditViewModel;
