import { Observable } from 'rx';

import { wx } from '../../../WebRx';
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

  constructor(protected defaultLimit = StandardLimits[0], isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.itemCount = wx.property<number>(0);
    this.limit = wx.property<number>(defaultLimit);
    this.selectPage = wx.asyncCommand((x: number) => Observable.of(x));

    this.pageCount = wx
      .whenAny(this.itemCount, this.limit, (ic, l) => ({ ic, l }))
      // if we have a valid item count and limit, then calculate the page count (default to zero)
      .map(x => (x.ic != null && x.l != null && x.ic > 0 && x.l > 0) ? Math.ceil(x.ic / x.l) : 0)
      .toProperty(0);

    this.selectedPage = wx
      .whenAny(this.selectPage.results, this.pageCount, (sp, pc) => ({ sp, pc }))
      // if we have a valid page and page count, and page is higher than page count then revert to page 1
      // this can occur when the limit is adjusted and page is near the end
      .map(x => (x.sp > 0 && x.pc > 0 && x.sp > x.pc) ? 1 : x.sp)
      .toProperty(1);

    this.offset = wx
      .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
      // if we have a valid page then calculate the offset (default limit to zero to result in a zero offset)
      .map(x => (x.sp != null && x.sp > 0) ? (x.sp - 1) * (x.l || 0) : 0)
      .toProperty(0);

    this.subscribe(
      wx
        .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
        .filter(x => x.sp != null && x.l != null)
        .invokeCommand(this.routingStateChanged),
    );
  }

  saveRoutingState(state: PagerRoutingState) {
    if (this.limit() != null && this.limit() !== this.defaultLimit) {
      // only assign the limit routing state if it is valid and not the default
      state.limit = this.limit();
    }

    if ((this.selectedPage() || 1) > 1) {
      // only assign the page routing state if it is past the first page
      state.page = this.selectedPage();
    }
  }

  loadRoutingState(state: PagerRoutingState) {
    const prevState = this.routingState() || <PagerRoutingState>{};

    if (state.limit == null && prevState.limit != null) {
      // transitioning to the default routing state for limit, use defaultLimit
      state.limit = this.defaultLimit;
    }

    if (state.page == null && prevState.page != null) {
      // transitioning to the default routing state for page, use the first page
      state.page = 1;
    }

    this.limit(state.limit || this.limit() || 0);
    this.selectPage.execute(state.page || this.selectedPage() || 1);
  }
}
