'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

export interface ISearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<ISearchRoutingState> {
  constructor(isRoutingEnabled = false) {
    super(isRoutingEnabled);
  }

  public filter = wx.property('');
  public search = wx.command();

  initialize() {
    this.subscribe(this.search.results.subscribe(x => {
      this.routingStateChanged();
    }));
  }

  getRoutingState() {
    return this.createRoutingState(state => {
      if (String.isNullOrEmpty(this.filter()) === false) {
        state.filter = this.filter();
      }
    })
  }

  setRoutingState(state = {} as ISearchRoutingState) {
    if (this.isRoutingEnabled) {
      this.filter(state.filter || '');
    }
  }
}

export default SearchViewModel;
