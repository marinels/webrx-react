import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
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

  public readonly filter: Property<string>;
  public readonly requests: ReadOnlyProperty<SearchRequest>;

  public readonly search: Command<any>;

  constructor(private readonly liveSearchTimeout = 250, private readonly isCaseInsensitive = true, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.filter = this.property('');

    // search is executed when a search is to be performed
    this.search = this.command();

    this.requests = this
      // project search executions into filter values
      .whenAny(this.search.results, () => this.filter.value)
      // then map into a search request with regex
      .map(filter => (<SearchRequest>{
        filter,
        regex: this.createRegex(filter),
      }))
      .toProperty();

    if (this.liveSearchTimeout > 0) {
      this.addSubscription(
        this.filter.changed
          // debounce on the live search timeout
          .debounce(this.liveSearchTimeout)
          .invokeCommand(this.search),
      );
    }

    this.addSubscription(this.search.results
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
    let regex: RegExp | undefined;

    // prefix a filter with ~ to disable standard regex parsing
    if (String.isNullOrEmpty(filter) === false && filter[0] !== '~') {
      try {
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : undefined);
      }
      catch (e) {
        // drop out and create a safe regex
      }
    }

    if (regex == null) {
      if (filter[0] === '~' && filter.length > 1) {
        filter = filter.substr(1);
      }

      if (String.isNullOrEmpty(filter) === false) {
        // escape any regex syntax characters from the filter and create a "safe" regex
        // see: http://stackoverflow.com/a/6300234/2789877
        filter = filter.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        regex = new RegExp(filter, this.isCaseInsensitive ? 'i' : undefined);
      }
    }

    return regex;
  }

  saveRoutingState(state: SearchRoutingState) {
    if (String.isNullOrEmpty(this.filter.value) === false) {
      state.filter = this.filter.value;
    }
  }

  loadRoutingState(state: SearchRoutingState) {
    const prevState = this.routingState.value || <SearchRoutingState>{};

    if (state.filter == null && prevState.filter != null) {
      state.filter = '';
    }

    this.filter.value = state.filter || this.filter.value || '';
  }
}
