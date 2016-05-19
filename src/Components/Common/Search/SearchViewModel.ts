import * as Rx from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface ISearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<ISearchRoutingState> {
  public static displayName = 'SearchViewModel';

  public filter = wx.property('');
  public regex = this.filter.changed
    .debounce(this.isLiveSearchEnabled ? this.liveSearchTimeout : 0)
    .distinctUntilChanged()
    .select(x => this.createRegex(x))
    .toProperty();

  public search = wx.asyncCommand((x: RegExp) => {
    this.notifyChanged();

    return Rx.Observable.return(x);
  });

  constructor(public isLiveSearchEnabled = false, private liveSearchTimeout = 250, private isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);
  }

  public get results() {
    return this.search.results;
  }

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
    this.subscribe(this.results
      .invokeCommand(this.routingStateChanged));

    if (this.isLiveSearchEnabled) {
      this.subscribe(this.regex.changed
        .invokeCommand(this.search)
      );
    }
  }

  saveRoutingState(state: ISearchRoutingState) {
    if (String.isNullOrEmpty(this.filter()) === false) {
      state.filter = this.filter();
    }
  }

  loadRoutingState(state: ISearchRoutingState) {
    this.filter(state.filter || '');
  }
}
