import { Observable } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseRoutableViewModel } from '../../React/BaseRoutableViewModel';

export const StandardLimits = [ 10, 25, 0 ];
export const AlwaysPagedLimits = StandardLimits.filter(x => x != null && x > 0);

export interface PageRequest {
  offset: number;
  limit: number;
}

export interface PagerRoutingState {
  page: number;
  limit: number;
}

export class PagerViewModel extends BaseRoutableViewModel<PagerRoutingState> {
  public static displayName = 'PagerViewModel';

  public readonly itemCount: Property<number>;
  public readonly limit: Property<number>;
  public readonly selectedPage: ReadOnlyProperty<number>;
  public readonly pageCount: ReadOnlyProperty<number>;
  public readonly offset: ReadOnlyProperty<number>;
  public readonly requests: ReadOnlyProperty<PageRequest>;

  public readonly selectPage: Command<number>;

  constructor(protected readonly defaultLimit = StandardLimits[0], isRoutingEnabled = false) {
    super(isRoutingEnabled);

    this.itemCount = this.property(0);
    this.limit = this.property(defaultLimit);
    this.selectPage = this.command<number>();

    this.pageCount = this
      .whenAny(this.itemCount, this.limit, (ic, l) => ({ ic, l }))
      // if we have a valid item count and limit, then calculate the page count (default to zero)
      .map(x => (x.ic != null && x.l != null && x.ic > 0 && x.l > 0) ? Math.ceil(x.ic / x.l) : 0)
      .toProperty(0);

    this.selectedPage = this
      .whenAny(this.selectPage.results, this.pageCount, (sp, pc) => ({ sp, pc }))
      // if we have a valid page and page count, and page is higher than page count then revert to page 1
      // this can occur when the limit is adjusted and page is near the end
      .map(x => (x.sp > 0 && x.pc > 0 && x.sp > x.pc) ? 1 : x.sp)
      .toProperty(1);

    this.offset = this
      .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
      // if we have a valid page then calculate the offset (default limit to zero to result in a zero offset)
      .map(x => (x.sp != null && x.sp > 0) ? (x.sp - 1) * (x.l || 0) : 0)
      .toProperty(0);

    this.requests = this
      .whenAny(
        this.offset,
        this.limit,
        (offset, limit) => ({
          offset,
          limit,
        }),
      )
      .toProperty();

    this.addSubscription(this
      .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
      .filter(x => x.sp != null && x.l != null)
      .invokeCommand(this.routingStateChanged),
    );
  }

  saveRoutingState(state: PagerRoutingState) {
    if (this.limit.value != null && this.limit.value !== this.defaultLimit) {
      // only assign the limit routing state if it is valid and not the default
      state.limit = this.limit.value;
    }

    if ((this.selectedPage.value || 1) > 1) {
      // only assign the page routing state if it is past the first page
      state.page = this.selectedPage.value;
    }
  }

  loadRoutingState(state: PagerRoutingState) {
    const prevState = this.routingState.value || <PagerRoutingState>{};

    if (state.limit == null && prevState.limit != null) {
      // transitioning to the default routing state for limit, use defaultLimit
      state.limit = this.defaultLimit;
    }

    if (state.page == null && prevState.page != null) {
      // transitioning to the default routing state for page, use the first page
      state.page = 1;
    }

    this.limit.value = state.limit || this.limit.value || 0;
    this.selectPage.execute(state.page || this.selectedPage.value || 1);
  }
}
