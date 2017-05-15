import { Observable } from 'rx';

import { ReadOnlyProperty, Property, Command } from '../../WebRx';
import { Route } from '../../Routing/RouteManager';
import { HeaderCommandAction, HeaderMenu } from '../React/Actions';
import { BaseRoutableViewModel, isRoutableViewModel, RoutingBreadcrumb } from '../React/BaseRoutableViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { Current as App } from '../Common/App/AppViewModel';
import { RouteMap, ViewModelActivator } from './RoutingMap';
import { RouteMap as AppRouteMap } from '../../Routing/RoutingMap';

// inject the demo infrastructure into the app routing and view maps
AppRouteMap['/'] = { path: '/demo/' };
AppRouteMap['^/demo$'] = { path: '/demo/' };
// setup the demo route path pattern
AppRouteMap['^/demo/(.*)?'] = { path: '/demo', creator: () => new ComponentDemoViewModel() };

export interface ComponentDemoRoutingState {
  route: Route;
  componentRoute: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<ComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel;
  private readonly demoAlertItem: HeaderCommandAction;

  public readonly componentRoute: Property<string | undefined>;
  public readonly columns: Property<number>;
  public readonly component: ReadOnlyProperty<any>;

  public readonly setColumns: Command<number>;
  public readonly reRender: Command<any>;

  constructor() {
    super(true);

    this.componentRoute = this.property<string>();
    this.columns = this.property(12);

    this.reRender = this.command();
    const demoAlert = this.command(Observable.of(true), (x: string) => this.createAlert(x, 'Demo Alert'));

    this.demoAlertItem = {
      id: 'demo-alert-item',
      header: 'Generate Alert',
      command: demoAlert,
      visibleWhenDisabled: true,
      iconName: 'flask',
    };

    this.component = this
      .whenAny(this.routingState, this.reRender.results.startWith(null), x => x)
      .map(x => this.getViewModel(x))
      .toProperty();

    this.addSubscription(this
      .whenAny(this.columns.changed, x => null)
      .invokeCommand(this.routingStateChanged),
    );

    this.addSubscription(this
      .whenAny(this.component, x => x)
      .subscribe(x => {
        if (this.pageHeader != null) {
          this.pageHeader.updateDynamicContent();
        }
      }),
    );

    // set a default title
    this.updateDocumentTitle.execute('Loading Demos...');

    // simulate some breadcrumbs
    this.updateRoutingBreadcrumbs.execute(<RoutingBreadcrumb[]>[
      { key: 1, content: 'Here', href: '#/demo' },
      { key: 2, content: 'Are', href: '#/demo' },
      { key: 3, content: 'Some', href: '#/demo' },
      { key: 4, content: 'Breadcrumbs', href: '#/demo' },
    ]);

    // this is very similar to what the route handler does for title updates
    // we are essentially projecting the demo title and passing it up the chain
    this.addSubscription(this
      .whenAny(this.component, x => x)
      .debounce(100)
      .subscribe(component => {
        if (isRoutableViewModel(component)) {
          this.addSubscription(this
            .whenAny(component.documentTitle, x => String.isNullOrEmpty(x) ? Object.getName(component) : x)
            .debounce(100)
            .map(x => `Demo: ${ x }`)
            .invokeCommand(this.updateDocumentTitle),
          );
        }
        else {
          let title: string;

          if (component == null) {
            title = 'No Routed Component';
          }
          else if (String.isString(component)) {
            title = component;
          }
          else {
            title = Object.getName(component);
          }

          this.updateDocumentTitle.execute(`Demo: ${ title }`);
        }
      }),
    );
  }

  private getComponentRoute(state: ComponentDemoRoutingState) {
    return state == null ? undefined : state.route.match[1];
  }

  private getViewModel(state: ComponentDemoRoutingState) {
    let component: any;
    let activator: ViewModelActivator;

    // extract the component route from the routing state
    const componentRoute = this.getComponentRoute(state);

    // if our component route is null then we can ignore activation
    // let the routing system perform some automated navigation to a new route
    if (componentRoute != null) {
      if (componentRoute === this.componentRoute.value && this.component.value != null) {
        this.logger.debug(`Using Previously Activated Component for "${ componentRoute }"...`);

        // if our component route has not changed then we can just use our previously activated component
        component = this.component.value;
      }
      else {
        this.logger.debug(`Loading Component for "${ componentRoute }"...`);

        // try and load our component from the component map using a static route
        activator = RouteMap.viewModelMap[componentRoute];

        // if no static route was found then we can attempt an expression route
        if (activator == null) {
          // project out the first expression route match (path, match, and activator)
          let result = Object.keys(RouteMap.viewModelMap)
            .filter(x => x != null && x.length > 0 && x[0] === '^')
            .map(x => ({ path: x, regex: new RegExp(x, 'i') }))
            .map(x => ({ path: x.path, match: x.regex.exec(componentRoute) }))
            .filter(x => x.match != null)
            .map(x => ({ path: x.path, match: x.match!, activator: RouteMap.viewModelMap[x.path] }))
            .asEnumerable()
            .firstOrDefault();

          if (result != null) {
            // if we found an expression route match, assign our activator
            activator = result.activator;

            // and override the routed state's path and match with the demo's context
            state.route.path = result.path;
            state.route.match = result.match;
          }
        }

        // activate our component from the routing state
        component = activator == null ? null : activator(state);

        if (component != null) {
          this.logger.debug(`Loaded Component "${ Object.getName(component) }"`, component);
        }
      }
    }

    // if our activated component is routable, then apply the current routing state
    if (isRoutableViewModel(component)) {
      component.setRoutingState(state);
    }

    // finally save our current component route
    this.componentRoute.value = componentRoute;

    return component;
  }

  routed() {
    this.pageHeader = App.header;
  }

  saveRoutingState(state: ComponentDemoRoutingState): any {
    state.route = <Route>{
      path: `/demo/${ this.componentRoute.value }`,
    };

    if (this.columns.value !== 12) {
      state.columns = this.columns.value;
    }

    const component = this.component.value;

    if (isRoutableViewModel(component)) {
      Object.assign(state, component.getRoutingState('demo'));
    }
  }

  loadRoutingState(state: ComponentDemoRoutingState) {
    const prevState = this.routingState.value || <ComponentDemoRoutingState>{};
    const componentRoute = this.getComponentRoute(state);

    if (String.isNullOrEmpty(componentRoute) === true) {
      // if we have no component route then choose the first one
      const uri = RouteMap.menus
        .asEnumerable()
        .selectMany(x => x.items.asEnumerable().map(y => y.uri))
        .filter(x => String.isNullOrEmpty(x) === false)
        .firstOrDefault();

      if (!String.isNullOrEmpty(uri)) {
        type t = typeof uri;
      }
      else {
        type t = typeof uri;
      }
      if (!String.isNullOrEmpty(uri)) {
        // providing there exists at least one component route, navigate to it
        this.navTo(uri, undefined, true);
      }
    }
    else {
      if (state.columns == null && prevState.columns != null) {
        // if colums were previously specified, but omitted in the current routing state
        // then "reset" the columns to 12
        state.columns = 12;
      }

      // update the columns from the state, fallback on existing columns, then two 12 as the default
      this.columns.value = state.columns || (this.columns.value == null ? 12 : this.columns.value);

      const component = this.component.value;

      if (isRoutableViewModel(component)) {
        component.setRoutingState(state);
      }
    }
  }

  getSearch() {
    let viewModel = <BaseRoutableViewModel<any>>this.component.value;

    return (viewModel != null && viewModel.getSearch != null) ? viewModel.getSearch() : null;
  }

  getSidebarMenus() {
    return <HeaderMenu[]>[
      {
        id: 'sidebar-1',
        header: 'Section 1',
        items: [
          Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-1`, commandParameter: 'Sidebar Section 1 Menu Item' }),
        ],
      },
      {
        id: 'sidebar-2',
        header: 'Section 2',
        items: [
          Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-1`, commandParameter: 'Sidebar Section 2 Menu Item 1' }),
          Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-2`, commandParameter: 'Sidebar Section 2 Menu Item 2' }),
        ],
      },
    ];
  }

  getNavbarMenus() {
    return RouteMap.menus
      .concat(<HeaderMenu>{
        id: `${ this.demoAlertItem.id }-menu`,
        header: 'Sample Routed Menu',
        order: -1,
        items: [
          Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-menuitem`, commandParameter: 'Routed Menu Item' }),
        ],
      });
  }

  getNavbarActions() {
    return <HeaderCommandAction[]>[
      { id: 'reRender', header: 'Re-Render', command: this.reRender, bsStyle: 'primary' },
      Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-navbar`, commandParameter: 'Navbar Action' }),
    ];
  }

  getHelpMenuItems() {
    return <HeaderCommandAction[]>[
      Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-help`, commandParameter: 'Help Menu Item' }),
    ];
  }

  getAdminMenuItems() {
    return <HeaderCommandAction[]>[
      Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-admin`, commandParameter: 'Admin Menu Item' }),
    ];
  }

  getUserMenuItems() {
    return <HeaderCommandAction[]>[
      Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-user`, commandParameter: 'User Menu Item' }),
    ];
  }
}
