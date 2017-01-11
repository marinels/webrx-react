import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SearchRequest {
  filter: string;
  regex: RegExp;
}

export interface SearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<SearchRoutingState> {
  public static displayName = 'SearchViewModel';

  public filter: wx.IObservableProperty<string>;
  public requests: wx.IObservableReadOnlyProperty<SearchRequest>;

  public search: wx.ICommand<any>;

  constructor(private liveSearchTimeout = 250, private isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.filter = wx.property('');

    // search is executed when a search is to be performed
    this.search = wx.command();

    this.requests = wx
      // project search executions into filter values
      .whenAny(this.search.results, () => this.filter())
      // then map into a search request with regex
      .map(filter => (<SearchRequest>{
        filter,
        regex: this.createRegex(filter),
      }))
      .toProperty();

    if (this.liveSearchTimeout > 0) {
      this.subscribe(
        this.filter.changed
          // debounce on the live search timeout
          .debounce(this.liveSearchTimeout)
          .invokeCommand(this.search),
      );
    }

    this.subscribe(this.search.results
      .invokeCommand(this.routingStateChanged),
    );
  }

  public get filterRequests() {
    return this.requests.changed.map(x => x.filter);
  }

  public get regexRequests() {
    return this.requests.changed.map(x => x.regex);
  }

  protected createRegex(filter: string) {
    let regex: RegExp = null;

    if (String.isNullOrEmpty(filter) === false) {
      try {
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : null);
      }
      catch (e) {
        // strip any regex syntax characters from the filter and create a "safe" escaped regex
        // see: http://stackoverflow.com/a/6300234/2789877
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
