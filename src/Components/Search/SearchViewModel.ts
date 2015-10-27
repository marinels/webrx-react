'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseViewModel from '../React/BaseViewModel';

export class SearchViewModel extends BaseViewModel {
  public filter = wx.property('');
  public search = wx.command(this.filter.changed.select(x => String.isNullOrEmpty(x) == false));
}

export default SearchViewModel;
