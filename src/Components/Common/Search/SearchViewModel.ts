'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseRoutableViewModel from '../../React/BaseRoutableViewModel';

export interface ISearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<ISearchRoutingState> {
  public static displayName = 'SearchViewModel';

  constructor(public isLiveSearchEnabled = false, private liveSearchTimeout = 250, private isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);
  }

  public filter = wx.property('');
  public regex = this.filter.changed
    .select(x => this.createRegex(x))
    .distinctUntilChanged()
    .toProperty();

  public search = wx.asyncCommand((x: RegExp) => {
    this.notifyChanged();

    return Rx.Observable.return(x);
  });

  protected createRegex(filter: string) {
    let regex: RegExp = null;

    if (String.isNullOrEmpty(filter) === false) {
      try {
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : null);
      } catch (e) {
        filter = filter.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : null);
      }
    }

    return regex;
  }

  initialize() {
    super.initialize();

    this.subscribe(this.search.results
      .invokeCommand(this.routingStateChanged));

    if (this.isLiveSearchEnabled) {
      this.subscribe(this.regex.changed
        .debounce(this.liveSearchTimeout)
        .invokeCommand(this.search)
      );
    }
  }

  getRoutingState(context?: any) {
    return this.createRoutingState(state => {
      if (String.isNullOrEmpty(this.filter()) === false) {
        state.filter = this.filter();
      }
    });
  }

  setRoutingState(state: ISearchRoutingState) {
    this.handleRoutingState(state, state => {
      this.filter(state.filter || '');
    });
  }
}

export default SearchViewModel;
