import { Observable } from 'rxjs';
import { Tooltip } from 'react-bootstrap';

import { ReadOnlyProperty, Property, Command } from '../../WebRx';
import { Route } from '../../Routing';
import {
  HeaderCommandAction, HeaderMenu, HandlerRoutingStateChanged, isRoutingStateHandler,
  BaseRoutableViewModel, isRoutableViewModel, RoutingBreadcrumb, Search } from '../React';
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
  route?: Route;
  columns?: number;
  state?: any;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<ComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel;
  private readonly demoAlertItem: HeaderCommandAction;

  public readonly columns: ReadOnlyProperty<number>;
  public readonly componentRoute: ReadOnlyProperty<string | undefined>;
  public readonly routedComponent: ReadOnlyProperty<RoutedDemoComponent>;
  public readonly component: ReadOnlyProperty<any>;

  public readonly setComponent: Command<RoutedDemoComponent>;
  public readonly setColumns: Command<number>;
  public readonly reRender: Command<any>;

  constructor(protected readonly routeMap: RoutingMap) {
    super();

    this.setComponent = this.wx.command<RoutedDemoComponent>();
    this.setColumns = this.wx.command<number>();
    this.reRender = this.wx.command();

    const demoAlert = this.wx.command(Observable.of(true), (x: string) => this.createAlert(x, 'Demo Alert'));

    this.demoAlertItem = {
      id: 'demo-alert-item',
      header: 'Generate Alert',
      command: demoAlert,
      visibleWhenDisabled: true,
      iconName: 'flask',
    };

    this.columns = this.wx
      .whenAny(this.setColumns, x => x)
      .toProperty(12);

    this.routedComponent = this.wx
      .whenAny(this.setComponent, this.reRender.results.startWith(undefined), x => x)
      .toProperty(undefined, false);

    this.componentRoute = this.wx
      .whenAny(this.routedComponent, x => x == null ? undefined : x.componentRoute)
      .toProperty(undefined, false);

    this.component = this.wx
      .whenAny(this.routedComponent, x => x == null ? undefined : x.component)
      .toProperty(undefined, false);

    this.addSubscription(
      this.wx
        .whenAny(this.columns.changed, x => x)
        .subscribe(x => {
          this.notifyChanged(x);
        }),
    );

    this.addSubscription(
      this.wx
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
    this.addSubscription(
      this.wx
        .whenAny(this.component, x => x)
        .debounceTime(100)
        .subscribe(component => {
          if (isRoutableViewModel(component)) {
            this.addSubscription(
              this.wx
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
    if (state == null || state.route == null) {
      return undefined;
    }

    if (Array.isArray(state.route.match) && state.route.match.length >= 2) {
      return state.route.match[1];
    }

    return undefined;
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
            routedComponent.routingState = Object.assign({}, state.state, { path: result.path, match: result.match });
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
      routedComponent.component.applyRoutingState(routedComponent.routingState);
    }

    return routedComponent;
  }

  createRoutingState(changed: HandlerRoutingStateChanged): ComponentDemoRoutingState {
    let state: any = undefined;

    if (isRoutingStateHandler(this.component.value)) {
      state = this.component.value.createRoutingState();
    }

    let columns: number | undefined;

    if (this.columns.value !== 12) {
      columns = this.columns.value;
    }

    return Object.trim({
      route: {
        path: `/demo/${ this.componentRoute.value || '' }`,
      },
      columns: this.getRoutingStateValue(this.columns.value, 12),
      state: this.getRoutingStateValue(this.component.value, (x: any) => {
        if (isRoutingStateHandler(x)) {
          return x.createRoutingState();
        }

        return undefined;
      }),
    });
  }

  applyRoutingState(state: ComponentDemoRoutingState) {
    const routedComponent = this.getRoutedComponent(state);

    // if there is no route, then route to help view
    if (routedComponent == null || String.isNullOrEmpty(routedComponent.componentRoute)) {
      this.navTo('#/demo/help');
    }
    else {
      this.setComponent.execute(routedComponent);
      this.setColumns.execute(state.columns || 12);
    }

    this.pageHeader = App.header;
  }

  getSearch() {
    if (isRoutableViewModel(this.component.value)) {
      return this.component.value.getSearch();
    }

    return undefined;
  }

  getSidebarMenus(): Array<HeaderMenu> {
    return [
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
          Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-1`, commandParameter: 'Sidebar Section 1 Menu Item' }),
        ],
      },
      {
        id: 'sidebar-2',
        header: 'Section 2',
        items: [
          Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-1`, commandParameter: 'Sidebar Section 2 Menu Item 1' }),
          Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-2`, commandParameter: 'Sidebar Section 2 Menu Item 2' }),
        ],
      },
    ];
  }

  getNavbarMenus(): Array<HeaderMenu> {
    return this.routeMap.menus
      .concat({
        id: `${ this.demoAlertItem.id }-menu`,
        header: 'Sample Routed Menu',
        order: -1,
        items: [
          Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-menuitem`, commandParameter: 'Routed Menu Item' }),
        ],
      });
  }

  getNavbarActions(): Array<HeaderCommandAction> {
    return [
      { id: 'reRender', header: 'Re-Render', command: this.reRender, bsStyle: 'primary' },
      Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-navbar`, commandParameter: 'Navbar Action' }),
    ];
  }

  getHelpMenuItems(): Array<HeaderCommandAction> {
    return [
      Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-help`, commandParameter: 'Help Menu Item' }),
    ];
  }

  getAdminMenuItems(): Array<HeaderCommandAction> {
    return [
      Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-admin`, commandParameter: 'Admin Menu Item' }),
    ];
  }

  getUserMenuItems(): Array<HeaderCommandAction> {
    return [
      Object.assign({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-user`, commandParameter: 'User Menu Item' }),
    ];
  }
}
