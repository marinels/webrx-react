'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

export interface ISearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<ISearchRoutingState> {
  constructor(public isLiveSearchEnabled = true, private liveSearchTimeout = 250, isRoutingEnabled = false) {
    super(isRoutingEnabled);
  }

  public filter = wx.property('');
  public search = wx.command(x => this.notifyChanged());

  initialize() {
    super.initialize();

    this.subscribe(this.search.results.subscribe(x => {
      this.routingStateChanged();
    }));

    if (this.isLiveSearchEnabled) {
      this.subscribe(this.filter.changed
        .debounce(this.liveSearchTimeout)
        .invokeCommand(this.search)
      );
    }
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
