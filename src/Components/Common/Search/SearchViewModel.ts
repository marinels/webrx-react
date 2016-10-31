import { Observable } from  'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<SearchRoutingState> {
  public static displayName = 'SearchViewModel';

  public filter = wx.property('');
  public regex = this.filter.changed
    .debounce(this.isLiveSearchEnabled ? this.liveSearchTimeout : 0)
    .distinctUntilChanged()
    .select(x => this.createRegex(x))
    .toProperty();

  public search = wx.asyncCommand((x: RegExp) => {
    this.notifyChanged();

    return Observable.of(x);
  });

  constructor(public isLiveSearchEnabled = false, private liveSearchTimeout = 250, private isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.subscribe(this.results
      .invokeCommand(this.routingStateChanged));

    if (this.isLiveSearchEnabled) {
      this.subscribe(this.regex.changed
        .invokeCommand(this.search)
      );
    }
  }

  public get results() {
    return this.search.results;
  }

  protected createRegex(filter: string) {
    let regex: RegExp = null;

    if (String.isNullOrEmpty(filter) === false) {
      try {
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : null);
      }
      catch (e) {
        filter = filter.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : null);
      }
    }

    return regex;
  }

  saveRoutingState(state: SearchRoutingState) {
    if (String.isNullOrEmpty(this.filter()) === false) {
      state.filter = this.filter();
    }
  }

  loadRoutingState(state: SearchRoutingState) {
    this.filter(state.filter || '');
  }
}
