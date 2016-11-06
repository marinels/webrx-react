import { Observable } from  'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface SearchRoutingState {
  filter: string;
}

export class SearchViewModel extends BaseRoutableViewModel<SearchRoutingState> {
  public static displayName = 'SearchViewModel';

  public filter: wx.IObservableProperty<string>;
  public regex: wx.IObservableReadOnlyProperty<RegExp>;

  public search: wx.ICommand<RegExp>;

  constructor(public isLiveSearchEnabled = false, private liveSearchTimeout = 250, private isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.filter = wx.property('');

    this.regex = wx
      .whenAny(this.filter, x => x)
      .debounce(this.isLiveSearchEnabled ? this.liveSearchTimeout : 0)
      .map(x => this.createRegex(x))
      .toProperty();

    this.search = wx.asyncCommand((x: RegExp) => {
      this.notifyChanged();

      return Observable.of(x);
    });

    this.subscribe(this.results
      .invokeCommand(this.routingStateChanged)
    );

    if (this.isLiveSearchEnabled === true) {
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
