'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

import BaseRoutableViewModel from '../React/BaseRoutableViewModel';

export interface IPagerRoutingState {
  limit: number;
  page: number;
}

export class PagerViewModel extends BaseRoutableViewModel<IPagerRoutingState> {
  constructor(limit?: number, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.limit(limit);
  }

  public itemCount = wx.property<number>();
  public limit = wx.property<number>();
  public pageCount = Rx.Observable
    .combineLatest(this.itemCount.changed, this.limit.changed, (c, l) => Math.ceil(c / l))
    .toProperty();
  public selectedPage = wx.property<number>();
  public offset = this.selectedPage.changed
    .select(x => (x - 1) * this.limit() || 0)
    .toProperty();

  initialize() {
    this.pageCount.changed
      .subscribe(x => {
        this.selectedPage(1);
      });

    this.selectedPage.changed
      .subscribe(x => {
        this.routingStateChanged();
      })
  }

  getRoutingState() {
    return this.createRoutingState(state => {
      if (this.hasValidLimit()) {
        state.limit = this.limit();
        state.page = this.selectedPage();
      }
    });
  }

  setRoutingState(state = {} as IPagerRoutingState) {
    if (this.isRoutingEnabled) {
      this.limit(state.limit);
      this.selectedPage(state.page);
    }
  }

  public hasValidLimit() {
    return this.isValidLimit(this.limit());
  }

  private isValidLimit(limit: number) {
    return limit != null && limit > 0;
  }
}

export default PagerViewModel;
