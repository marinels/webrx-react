import { Observable } from 'rx';
import * as wx from 'webrx';

import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export const StandardLimits = [ 10, 25, 0 ];
export const AlwaysPagedLimits = StandardLimits.filter(x => x != null && x > 0);

export interface PagerRoutingState {
  limit: number;
  page: number;
}

export class PagerViewModel extends BaseRoutableViewModel<PagerRoutingState> {
  public static displayName = 'PagerViewModel';

  public itemCount: wx.IObservableProperty<number>;
  public limit: wx.IObservableProperty<number>;
  public selectedPage: wx.IObservableReadOnlyProperty<number>;
  public pageCount: wx.IObservableReadOnlyProperty<number>;
  public offset: wx.IObservableReadOnlyProperty<number>;

  public selectPage: wx.ICommand<number>;

  constructor(limit = StandardLimits[0], isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.itemCount = wx.property<number>(0);
    this.limit = wx.property<number>(limit);
    this.selectPage = wx.asyncCommand((x: number) => Observable.of(x));

    this.pageCount = wx
      .whenAny(this.itemCount, this.limit, (ic, l) => ({ ic, l }))
      .map(x => (x.ic != null && x.l != null && x.ic > 0 && x.l > 0) ? Math.ceil(x.ic / x.l) : 0)
      .toProperty(0);

    this.selectedPage = wx
      .whenAny(this.selectPage.results, this.pageCount, (sp, pc) => ({ sp, pc }))
      .map(x => (x.sp != null && x.pc != null) ? x.sp : 0)
      .toProperty(0);

    this.offset = wx
      .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
      .map(x => (x.sp != null && x.sp > 0) ? (x.sp - 1) * (x.l || 0) : 0)
      .toProperty();

    this.subscribe(
      wx
        .whenAny(this.pageCount, this.selectedPage, (pc, sp) => ({ pc, sp }))
        .filter(x => (x.pc > 0 && x.sp === 0) || (x.pc === 0 && x.sp > 0))
        .map(x => x.pc > 0 ? 1 : 0)
        .invokeCommand(this.selectPage),
    );

    this.subscribe(
      wx
        .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
        .filter(x => x.sp != null && x.l != null)
        .invokeCommand(this.routingStateChanged),
    );
  }

  saveRoutingState(state: PagerRoutingState) {
    if ((this.limit() || 0) > 0) {
      state.limit = this.limit() || 0;
    }

    if ((this.selectedPage() || 1) > 1) {
      state.page = this.selectedPage();
    }
  }

  loadRoutingState(state: PagerRoutingState) {
    this.limit(state.limit || 0);
    this.selectedPage(state.page || 1);
  }
}
