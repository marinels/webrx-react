import { Observable } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseViewModel, RoutingStateHandler, HandlerRoutingStateChanged } from '../../React';

export interface SearchRequest {
  filter: string;
  regex: RegExp;
}

export interface SearchRoutingState {
  filter?: string;
}

export class SearchViewModel extends BaseViewModel implements RoutingStateHandler<SearchRoutingState> {
  public static displayName = 'SearchViewModel';

  protected readonly processRequests: Command<any>;

  public readonly filter: Property<string>;
  public readonly requests: ReadOnlyProperty<SearchRequest>;
  public readonly searchPending: ReadOnlyProperty<boolean>;

  public readonly search: Command<any>;
  public readonly clear: Command<any>;

  constructor(private readonly liveSearchTimeout = 500, private readonly isCaseInsensitive = true) {
    super();

    this.processRequests = this.wx.command();

    this.filter = this.wx.property('');

    // search is executed when a search is to be performed
    this.search = this.wx.command();

    this.clear = this.wx.command();

    this.requests = this.wx
      // project search executions into filter values
      .whenAny(
        this.search.results
          // debounce a little extra to protect against too many search invocations
          .debounceTime(250),
        // "gate" the requests until the processRequests command is invoked
        this.processRequests.results
          .take(1),
        x => x,
      )
      // then map into a search request with regex
      .map(x => (<SearchRequest>{
        filter: this.filter.value,
        regex: this.createRegex(this.filter.value),
      }))
      .toProperty();

    this.searchPending = Observable
      .merge(
        Observable
          .merge(
            this.filter.changed
              .map(() => true),
            this.search.results
              .map(() => true),
          ),
        this.requests.changed
          .map(() => false),
      )
      .toProperty(false);

    // check to see if we should queue up an initial search
    this.processRequests.results
      .take(1)
      .filter(() => {
        // check if we have a non-empty filter
        return String.isNullOrEmpty(this.filter.value) === false;
      })
      .invokeCommand(this.search);

    this.addSubscription(
      this.wx
        .whenAny(this.clear, x => x)
        .subscribe(() => {
          this.filter.value = '';
        }),
    );

    if (this.liveSearchTimeout > 0) {
      this.addSubscription(
        // "gate" live search activation until the processRequests command is invoked
        this.processRequests.results
          .take(1)
          .switchMap(() => this.filter.changed)
          .debounceTime(this.liveSearchTimeout)
          .invokeCommand(this.search),
      );
    }

    this.addSubscription(
      this.wx
        .whenAny(this.requests, x => x)
        .subscribe(x => {
          this.notifyChanged(x);
        }),
    );
  }

  isRoutingStateHandler() {
    return true;
  }

  createRoutingState(changed?: HandlerRoutingStateChanged): SearchRoutingState {
    return Object.trim({
      filter: this.getRoutingStateValue(this.filter.value, ''),
    });
  }

  applyRoutingState(state: SearchRoutingState) {
    this.filter.value = state.filter == null ? '' : String(state.filter);

    // notify our streams that we're routed and may begin processing requests
    this.processRequests.execute();
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
}
