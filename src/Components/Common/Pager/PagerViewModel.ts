import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseViewModel, RoutingStateHandler, HandlerRoutingStateChanged } from '../../React';

export const StandardLimits = [ 10, 25, 0 ];
export const AlwaysPagedLimits = StandardLimits.filter(x => x != null && x > 0);

export interface PageRequest {
  offset: number;
  limit: number;
}

export interface PagerRoutingState {
  page?: number;
  limit?: number;
}

export class PagerViewModel extends BaseViewModel implements RoutingStateHandler<PagerRoutingState> {
  public static displayName = 'PagerViewModel';

  public readonly itemCount: ReadOnlyProperty<number>;
  public readonly limit: Property<number>;
  public readonly selectedPage: ReadOnlyProperty<number>;
  public readonly pageCount: ReadOnlyProperty<number>;
  public readonly offset: ReadOnlyProperty<number>;
  public readonly requests: ReadOnlyProperty<PageRequest>;

  public readonly updateCount: Command<number>;
  public readonly selectPage: Command<number>;

  constructor(protected readonly defaultLimit = StandardLimits[0]) {
    super();

    this.updateCount = this.wx.command<number>();
    this.selectPage = this.wx.command<number>();

    this.itemCount = this.wx
      .whenAny(this.updateCount, x => x)
      .filterNull()
      .toProperty(0);

    this.limit = this.wx.property(defaultLimit);

    this.pageCount = this.wx
      .whenAny(this.itemCount, this.limit, (ic, l) => ({ ic, l }))
      // if we have a valid item count and limit, then calculate the page count (default to zero)
      .map(x => (x.ic != null && x.l != null && x.ic > 0 && x.l > 0) ? Math.ceil(x.ic / x.l) : 0)
      .toProperty(0);

    this.selectedPage = this.wx
      .whenAny(this.selectPage.results, x => x)
      .filterNull()
      .toProperty(1);

    this.offset = this.wx
      .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
      // if we have a valid page then calculate the offset (default limit to zero to result in a zero offset)
      .map(x => (x.sp != null && x.sp > 0) ? (x.sp - 1) * (x.l || 0) : 0)
      .toProperty(0);

    this.requests = this.wx
      .whenAny(
        this.offset,
        this.limit,
        (offset, limit) => ({
          offset,
          limit,
        }),
      )
      .toProperty();

    this.addSubscription(this.wx
      .whenAny(this.pageCount, x => x)
      .filterNull()
      .map(() => 1)
      .invokeCommand(this.selectPage),
    );

    this.addSubscription(
      this.wx
        .whenAny(this.selectedPage, this.limit, (sp, l) => ({ sp, l }))
        .filter(x => x.sp != null && x.l != null)
        .subscribe(x => {
          this.notifyChanged(x);
        }),
    );
  }

  isRoutingStateHandler() {
    return true;
  }

  createRoutingState(changed?: HandlerRoutingStateChanged): PagerRoutingState {
    return Object.trim({
      limit: this.getRoutingStateValue(this.limit.value, this.defaultLimit),
      page: this.getRoutingStateValue(this.selectedPage.value, 1),
    });
  }

  applyRoutingState(state: PagerRoutingState) {
    this.limit.value = state.limit == null ? this.defaultLimit : state.limit;

    if (this.selectedPage.value !== state.page) {
      // 0 is not a valid page so we can just use || fallback notation
      this.selectPage.execute(state.page || 1);
    }
  }
}
