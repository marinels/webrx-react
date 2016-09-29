import * as Rx from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export interface IPagerRoutingState {
  limit: number;
  page: number;
}

export class PagerViewModel extends BaseRoutableViewModel<IPagerRoutingState> {
  public static displayName = 'PagerViewModel';

  public updateItemCount = wx.command();
  public selectPage = wx.command();

  public limit = wx.property<number>();
  public itemCount = this.updateItemCount.results
    .select(x => x as number)
    .toProperty();
  public selectedPage = this.selectPage.results
    .select(x => x as number)
    .toProperty();
  public pageCount = Rx.Observable
    .combineLatest(
      this.itemCount.changed,
      this.limit.changed,
      (itemCount, limit) => ({ itemCount, limit })
    )
    .where(x => x.itemCount != null && x.limit != null && x.limit > 0)
    .select(x => Math.ceil(x.itemCount / x.limit))
    .toProperty();
  public offset = wx
    .whenAny(
      this.selectedPage,
      this.limit,
      (selectedPage, limit) => ({ selectedPage, limit })
    )
    .skip(1)
    .where(x => x.selectedPage != null)
    .select(x => (x.selectedPage - 1) * (x.limit || 0))
    .toProperty();

  constructor(limit?: number, isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.limit(limit);

    this.subscribe(this.pageCount.changed
      .select(x => this.selectedPage() || 1)
      .invokeCommand(this.selectPage));

    this.subscribe(wx
      .whenAny(
        this.selectedPage,
        this.limit,
        () => null
      )
      .skip(1)
      .invokeCommand(this.routingStateChanged));

    this.selectPage.execute(this.selectedPage() || 1);
  }

  private isValidLimit(limit: number) {
    return limit != null && limit > 0;
  }

  public hasValidLimit() {
    return this.isValidLimit(this.limit());
  }

  saveRoutingState(state: IPagerRoutingState) {
    if (this.hasValidLimit()) {
      state.limit = this.limit();
      state.page = this.selectedPage();
    }
  }

  loadRoutingState(state: IPagerRoutingState) {
    this.limit(state.limit || null);
    this.selectedPage(state.page || 1);
  }
}
