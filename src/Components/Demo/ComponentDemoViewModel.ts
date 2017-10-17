import { Observable } from 'rxjs';
import { Tooltip } from 'react-bootstrap';

import { ReadOnlyProperty, Property, Command } from '../../WebRx';
import { Route } from '../../Routing/RouteManager';
import { HeaderCommandAction, HeaderMenu } from '../React/Actions';
import { BaseRoutableViewModel, isRoutableViewModel, RoutingBreadcrumb } from '../React/BaseRoutableViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { Current as App } from '../Common/App/AppViewModel';

export interface ViewModelActivator {
  (state: any): any;
}

export interface ViewModelActivatorMap {
  [key: string]: ViewModelActivator;
}

export interface MenuMap {
  [key: string]: HeaderMenu;
}

export class RoutingMap {
  public static displayName = 'RoutingMap';

  public viewModelMap: ViewModelActivatorMap = {};
  public menuMap: MenuMap = {};

  constructor(private baseUri = '#/demo', private defaultIconName = 'flask') {
  }

  public addRoute(menuName: string, path: string, name: string, activator: ViewModelActivator, uri?: string, iconName?: string) {
    if (/^\w+$/.test(path)) {
      uri = uri || path;
      path = `^${ path }$`;
    }

    this.viewModelMap[path] = activator;
    const menu = this.menuMap[menuName] = this.menuMap[menuName] || <HeaderMenu>{
      id: menuName,
      header: `${ menuName } Demos`,
      items: [],
    };
    menu.items.push(<HeaderCommandAction>{ id: path, header: name, uri: this.getUri(path, uri), iconName: iconName || this.defaultIconName, order: menu.items.length });
  }

  public getUri(path: string, uri?: string) {
    return `${ this.baseUri }/${ uri || path }`;
  }

  public get menus() {
    return Object.getOwnPropertyNames(this.menuMap)
      .map(x => this.menuMap[x]);
  }
}

export interface RoutedDemoComponent {
  componentRoute?: string;
  component?: any;
  routingState?: any;
}

export interface ComponentDemoRoutingState {
  route: Route;
  componentRoute: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<ComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel;
  private readonly demoAlertItem: HeaderCommandAction;

  public readonly columns: Property<number>;
  public readonly componentRoute: ReadOnlyProperty<string | undefined>;
  public readonly routedComponent: ReadOnlyProperty<RoutedDemoComponent>;
  public readonly component: ReadOnlyProperty<any>;

  public readonly setColumns: Command<number>;
  public readonly reRender: Command<any>;

  constructor(protected readonly routeMap: RoutingMap) {
    super(true);

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

    this.routedComponent = this
      .whenAny(this.routingState, this.reRender.results.startWith(null), x => x)
      .map(x => {
        return this.getRoutedComponent(x);
      })
      .toProperty(undefined, false);

    this.componentRoute = this
      .whenAny(this.routedComponent, x => x == null ? undefined : x.componentRoute)
      .toProperty(undefined, false);

    this.component = this
      .whenAny(this.routedComponent, x => x == null ? undefined : x.component)
      .toProperty(undefined, false);

    this.addSubscription(this
      .whenAny(this.columns.changed, () => null)
      .invokeCommand(this.routingStateChanged),
    );

    this.addSubscription(this
      .whenAny(this.component, x => x)
      .subscribe(() => {
        if (this.pageHeader != null) {
          this.pageHeader.updateDynamicContent();
        }
      }),
    );

    // set a default title
    this.updateDocumentTitle.execute('Loading Demos...');

    // simulate some breadcrumbs
    this.updateRoutingBreadcrumbs.execute(<RoutingBreadcrumb[]>[
      { key: 1, content: 'Here', href: '#/demo', title: 'title-based tooltips supported' },
      { key: 2, content: 'Are', href: '#/demo', tooltip: 'simple string tooltip overlays' },
      { key: 3, content: 'Some', href: '#/demo', tooltip: { id: 'demo-tt', placement: 'top', children: 'custom props-based tooltip overlays' } },
      { key: 4, content: 'Breadcrumbs', href: '#/demo' },
    ]);

    // this is very similar to what the route handler does for title updates
    // we are essentially projecting the demo title and passing it up the chain
    this.addSubscription(this
      .whenAny(this.component, x => x)
      .debounceTime(100)
      .subscribe(component => {
        if (isRoutableViewModel(component)) {
          this.addSubscription(this
            .whenAny(component.documentTitle, x => String.isNullOrEmpty(x) ? Object.getName(component) : x)
            .debounceTime(100)
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
    if (state == null || state.route == null || Array.isArray(state.route.match) === false || state.route.match.length < 2) {
      return undefined;
    }

    return state.route.match[1];
  }

  private getRoutedComponent(state: ComponentDemoRoutingState) {
    let routedComponent: RoutedDemoComponent = {};
    // let component: any;
    let activator: ViewModelActivator;

    // extract the component route from the routing state
    const componentRoute = routedComponent.componentRoute = this.getComponentRoute(state);

    // if our component route is null then we can ignore activation
    // let the routing system perform some automated navigation to a new route
    if (componentRoute != null) {
      if (componentRoute === this.componentRoute.value && this.component.value != null) {
        this.logger.debug(`Using Previously Activated Component for "${ componentRoute }"...`);

        // if our component route has not changed then we can just use our previously activated component
        routedComponent = this.routedComponent.value;
      }
      else {
        this.logger.debug(`Loading Component for "${ componentRoute }"...`);

        routedComponent.routingState = state;

        // try and load our component from the component map using a static route
        activator = this.routeMap.viewModelMap[componentRoute];

        // if no static route was found then we can attempt an expression route
        if (activator == null) {
          // project out the first expression route match (path, match, and activator)
          let result = Object.keys(this.routeMap.viewModelMap)
            .asIterable()
            .filter(x => x != null && x.length > 0 && x[0] === '^')
            .map(x => ({ path: x, regex: new RegExp(x, 'i') }))
            .map(x => ({ path: x.path, match: x.regex.exec(componentRoute) }))
            .filter(x => x.match != null)
            .map(x => ({ path: x.path, match: x.match!, activator: this.routeMap.viewModelMap[x.path] }))
            .first();

          if (result != null) {
            // if we found an expression route match, assign our activator
            activator = result.activator;

            // and override the routed state's path and match with the demo's context
            routedComponent.routingState = Object.assign({}, state, { path: result.path, match: result.match });
          }
        }

        // activate our component from the routing state
        routedComponent.component = activator == null ? null : activator(state);

        if (routedComponent.component != null) {
          this.logger.debug(`Loaded Component "${ Object.getName(routedComponent.component) }"`, routedComponent.component);
        }
      }
    }

    // if our activated component is routable, then apply the current routing state
    if (isRoutableViewModel(routedComponent.component)) {
      routedComponent.component.setRoutingState(routedComponent.routingState);
    }

    return routedComponent;
  }

  routed() {
    this.pageHeader = App.header;
  }

  saveRoutingState(state: ComponentDemoRoutingState): any {
    // this will ensure we use a sane routing path when changing routing state
    state.route = <Route>{
      path: `/demo/${ this.componentRoute.value || '' }`,
    };

    if (this.columns.value !== 12) {
      state.columns = this.columns.value;
    }

    if (isRoutableViewModel(this.component.value)) {
      Object.assign(state, this.component.value.getRoutingState('demo'));
    }
  }

  loadRoutingState(state: ComponentDemoRoutingState) {
    // if there is no route, then route to help view
    if (this.getComponentRoute(state) == null) {
      this.navTo('#/demo/help');
      return;
    }

    // if colums were previously specified, but omitted in the current routing state
    // then "reset" the columns to 12
    if (state.columns == null && (this.routingState.value || {}).columns != null) {
      state.columns = 12;
    }

    // update the columns from the state, fallback on existing columns, then to 12 as the default
    this.columns.value = state.columns || this.columns.value || 12;

    if (isRoutableViewModel(this.component.value)) {
      this.component.value.setRoutingState(state);
    }
  }

  getSearch() {
    let viewModel = <BaseRoutableViewModel<any>>this.component.value;

    return (viewModel != null && viewModel.getSearch != null) ? viewModel.getSearch() : null;
  }

  getSidebarMenus() {
    return <HeaderMenu[]>[
      {
        id: 'sidebar-demos',
        header: 'Integration Demos',
        items: [
          { id: 'todolist', header: 'Todo List', uri: '#/demo/todolist', iconName: 'list' },
        ],
      },
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
    return this.routeMap.menus
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
