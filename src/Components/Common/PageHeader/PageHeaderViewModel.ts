import { Observable, Subscription } from 'rxjs';

import { ReadOnlyProperty, Property, Command } from '../../../WebRx';
import { BaseViewModel } from '../../React/BaseViewModel';
import { BaseRoutableViewModel, isRoutableViewModel } from '../../React/BaseRoutableViewModel';
import { HeaderAction, HeaderCommandAction, HeaderMenu, isHeaderCommandAction } from '../../React/Actions';
import { RouteHandlerViewModel } from '../RouteHandler/RouteHandlerViewModel';
import { SearchViewModel } from '../Search/SearchViewModel';

export class PageHeaderViewModel extends BaseViewModel {
  public static displayName = 'PageHeaderViewModel';

  private dynamicSubscriptions: Subscription;

  public search: SearchViewModel | undefined;
  public readonly sidebarMenus: Property<HeaderMenu[]>;
  public readonly navbarMenus: Property<HeaderMenu[]>;
  public readonly navbarActions: Property<HeaderCommandAction[]>;
  public readonly helpMenuItems: Property<HeaderCommandAction[]>;
  public readonly adminMenuItems: Property<HeaderCommandAction[]>;
  public readonly userMenuItems: Property<HeaderCommandAction[]>;
  public readonly isSidebarVisible: ReadOnlyProperty<boolean>;

  public readonly menuItemSelected: Command<HeaderCommandAction>;
  public readonly toggleSideBar: Command<boolean>;

  constructor(
    public readonly routeHandler: RouteHandlerViewModel,
    public readonly staticSidebarMenus: HeaderMenu[] = [],
    public readonly staticNavbarMenus: HeaderMenu[] = [],
    public readonly staticNavbarActions: HeaderCommandAction[] = [],
    public readonly staticHelpMenuItems: HeaderCommandAction[] = [],
    public readonly staticAdminMenuItems: HeaderCommandAction[] = [],
    public readonly staticUserMenuItems: HeaderCommandAction[] = [],
    public userImage?: string | undefined,
    public userDisplayName?: string | undefined,
    public homeLink = '#/',
  ) {
    super();

    this.dynamicSubscriptions = Subscription.EMPTY;

    this.sidebarMenus = this.property<HeaderMenu[]>();
    this.navbarMenus = this.property<HeaderMenu[]>();
    this.navbarActions = this.property<HeaderCommandAction[]>();
    this.helpMenuItems = this.property<HeaderCommandAction[]>();
    this.adminMenuItems = this.property<HeaderCommandAction[]>();
    this.userMenuItems = this.property<HeaderCommandAction[]>();

    this.toggleSideBar = this.command((isVisible: boolean) => {
      return Object.fallback(isVisible, !this.isSidebarVisible.value);
    });

    this.isSidebarVisible = this
      .whenAny(this.toggleSideBar.results, x => x)
      .toProperty(false);

    this.menuItemSelected = this.command<HeaderCommandAction>();

    this.addSubscription(this
      .whenAny(this.menuItemSelected.results, x => x)
      .filterNull()
      .map(() => false)
      .invokeCommand(this.toggleSideBar),
    );

    this.subscribeOrAlert(
      () => this
        .whenAny(this.menuItemSelected.results, x => x)
        .filterNull(),
      'Page Header Menu Item Error',
      x => {
        if (x.command != null) {
          x.command.execute(x.commandParameter);
        }
        else if (x.uri != null && x.uri.length > 0) {
          if (x.uri[0] === '#') {
            this.navTo(x.uri);
          }
          else {
            window.location.href = x.uri;
          }
        }
      },
    );

    this.addSubscription(this
      .whenAny(this.routeHandler.routedComponent, x => x)
      .subscribe(() => {
        this.updateDynamicContent();
      }),
    );
  }

  unsubscribe() {
    super.unsubscribe();

    this.dynamicSubscriptions = Subscription.unsubscribe(this.dynamicSubscriptions);
  }

  public updateDynamicContent() {
    let component = this.routeHandler.routedComponent.value;

    this.logger.debug('Updating Page Header Dynamic Content', component);

    if (isRoutableViewModel(component)) {
      this.search = component.getSearch.apply(component);
    }
    else {
      this.search = undefined;
    }

    // dispose any existing subscriptions to header actions
    this.dynamicSubscriptions = Subscription.unsubscribe(this.dynamicSubscriptions);

    // add our header actions
    this.addItems(this.sidebarMenus, this.staticSidebarMenus, component, x => x.getSidebarMenus);
    this.addItems(this.navbarMenus, this.staticNavbarMenus, component, x => x.getNavbarMenus);
    this.addItems(this.navbarActions, this.staticNavbarActions, component, x => x.getNavbarActions);
    this.addItems(this.helpMenuItems, this.staticHelpMenuItems, component, x => x.getHelpMenuItems);
    this.addItems(this.adminMenuItems, this.staticAdminMenuItems, component, x => x.getAdminMenuItems);
    this.addItems(this.userMenuItems, this.staticUserMenuItems, component, x => x.getUserMenuItems);
  }

  private addItems<T extends HeaderAction>(list: Property<T[]>, staticItems: T[], component?: any, delegateSelector?: (viewModel: BaseRoutableViewModel<any>) => (() => T[])) {
    let routedItems: T[] | undefined;

    // interrogate the routed component for items from the delegate selector
    if (delegateSelector != null && isRoutableViewModel(component)) {
      let selector = delegateSelector(component);
      if (selector != null) {
        routedItems = <T[]>selector.apply(component);
      }
    }

    // start with all the static items
    list.value = staticItems
      // then add any routed actions
      .concat(routedItems || [])
      // finally sort the list so that we retain a consistent order
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    // now that our list is populated with our header actions, subscribe to the
    // canExecute observable to manage the disabled status of any header action
    this.dynamicSubscriptions = new Subscription();

    this.dynamicSubscriptions.add(
      Observable
        .merge(
          ...list.value
            .map((x: HeaderAction) => isHeaderCommandAction(x) ? x : undefined)
            .filterNull()
            .map(x => x.command!.canExecuteObservable),
        )
        .invokeCommand(this.stateChanged),
    );
  }
}
