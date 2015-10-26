'use strict';

import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class PagerViewModel extends BaseViewModel {
  public pageCount = wx.property<number>();
  public selectedPage = wx.property<number>();
}

export default PagerViewModel;
