import { Observable } from 'rx';
import * as wx from 'webrx';

import { Route } from '../../Routing/RouteManager';
import { HeaderCommandAction, HeaderMenu } from '../React/Actions';
import { BaseRoutableViewModel, isRoutableViewModel } from '../React/BaseRoutableViewModel';
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
  component: any;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<ComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel;
  private demoAlertItem: HeaderCommandAction;

  public componentRoute: wx.IObservableProperty<string>;
  public columns: wx.IObservableProperty<number>;
  public component: wx.IObservableReadOnlyProperty<any>;

  public setColumns: wx.ICommand<number>;
  public reRender: wx.ICommand<any>;
  private demoAlert: wx.ICommand<any>;

  constructor() {
    super(true);

    this.componentRoute = wx.property<string>();
    this.columns = wx.property(12);

    this.reRender = wx.command();
    this.demoAlert = wx.command((x: string) => this.createAlert(x, 'Demo Alert'), Observable.of(true));

    this.demoAlertItem = {
      id: 'demo-alert-item',
      header: 'Generate Alert',
      command: this.demoAlert,
      visibleWhenDisabled: true,
      iconName: 'flask',
    };

    this.component = wx
      .whenAny(this.routingState, this.reRender.results.startWith(null), x => x)
      .map(x => this.getViewModel(x))
      .toProperty();

    this.subscribe(wx
      .whenAny(this.columns.changed, x => null)
      .invokeCommand(this.routingStateChanged),
    );

    this.subscribe(wx
      .whenAny(this.component, x => x)
      .subscribe(x => {
        if (this.pageHeader != null) {
          this.pageHeader.updateDynamicContent();
        }
      }),
    );

    // set a default title
    this.updateDocumentTitle.execute('Loading Demos...');

    // this is very similar to what the route handler does for title updates
    // we are essentially projecting the demo title and passing it up the chain
    this.subscribe(wx
      .whenAny(this.component, x => x)
      .debounce(100)
      .subscribe(component => {
        if (isRoutableViewModel(component)) {
          this.subscribe(wx
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
    return state == null ? null : state.route.match[1];
  }

  private getViewModel(state: ComponentDemoRoutingState) {
    let component: any = null;
    let activator: ViewModelActivator = null;

    // extract the component route from the routing state
    const componentRoute = this.getComponentRoute(state);

    // if our component route is null then we can ignore activation
    // let the routing system perform some automated navigation to a new route
    if (componentRoute != null) {
      if (componentRoute === this.componentRoute() && this.component() != null) {
        this.logger.debug(`Using Previously Activated Component for "${ componentRoute }"...`);

        // if our component route has not changed then we can just use our previously activated component
        component = this.component();
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
            .map(x => ({ path: x.path, match: x.match, activator: RouteMap.viewModelMap[x.path] }))
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
    this.componentRoute(componentRoute);

    return component;
  }

  routed() {
    this.pageHeader = App.header;
  }

  saveRoutingState(state: ComponentDemoRoutingState): any {
    state.route = <Route>{
      path: `/demo/${ this.componentRoute() }`,
    };

    if (this.columns() !== 12) {
      state.columns = this.columns();
    }

    const component = this.component();

    if (isRoutableViewModel(component)) {
      state.component = component.getRoutingState('demo');
    }
  }

  loadRoutingState(state: ComponentDemoRoutingState) {
    const prevState = this.routingState() || <ComponentDemoRoutingState>{};
    const componentRoute = this.getComponentRoute(state);

    if (String.isNullOrEmpty(componentRoute) === true) {
      // if we have no component route then choose the first one
      const uri = RouteMap.menus
        .asEnumerable()
        .selectMany(x => x.items.asEnumerable().map(y => y.uri))
        .filter(x => String.isNullOrEmpty(x) === false)
        .firstOrDefault();

      if (String.isNullOrEmpty(uri) === false) {
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
      this.columns(state.columns || (this.columns() == null ? 12 : this.columns()));

      const component = this.component();

      // if we have explicit component routing state available, then pass it on
      // NOTE: we won't typically have any state here, unless the component is firing
      //       routing state changed events
      if (isRoutableViewModel(component) && state.component != null) {
        component.setRoutingState(state.component);
      }
    }
  }

  getSearch() {
    let viewModel = <BaseRoutableViewModel<any>>this.component();

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
