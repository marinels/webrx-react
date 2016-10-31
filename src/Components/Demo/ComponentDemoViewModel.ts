import * as wx from 'webrx';
import { Enumerable } from 'ix';

import { Route } from '../../Routing/RouteManager';
import { HeaderCommandAction, HeaderMenu, HeaderMenuItem } from '../Common/PageHeader/Actions';
import { BaseRoutableViewModel } from '../React/BaseRoutableViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { Current as App } from '../Common/App/AppViewModel';
import { Default as RoutingMap, ViewModelActivator } from './RoutingMap';

export interface ComponentDemoRoutingState {
  route: Route;
  componentRoute: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<ComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel = null;

  public componentRoute: string;

  public columns = wx.property(12);
  public component = wx.property<any>(null);

  public reRender = wx.command(x => {
    const state = this.routingState() || <ComponentDemoRoutingState>{};
    state.componentRoute = this.componentRoute;
    this.setRoutingState(state);
  });

  private demoAlert = wx.command(x => this.createAlert(x, 'Demo Alert'));
  private demoAlertItem = {
    id: 'demo-alert-item',
    header: 'Generate Alert',
    command: this.demoAlert,
    iconName: 'flask',
  };

  constructor() {
    super(true);

    this.subscribe(wx
      .whenAny(this.columns.changed, x => null)
      .invokeCommand(this.routingStateChanged)
    );

    this.subscribe(wx
      .whenAny(this.component, x => x)
      .subscribe(x => {
        if (this.pageHeader != null) {
          this.pageHeader.updateDynamicContent();
        }
      })
    );
  }

  private getViewModel(state: any) {
    let activator: ViewModelActivator = null;

    if (this.componentRoute != null) {
      this.logger.debug(`Loading View Model for "${this.componentRoute}"...`);
      activator = RoutingMap.viewModelMap[this.componentRoute];

      if (activator == null) {
        let result = Enumerable
          .fromArray(Object.keys(RoutingMap.viewModelMap))
          .filter(x => x != null && x.length > 0 && x[0] === '^')
          .map(x => ({ path: x, regex: new RegExp(x, 'i') }))
          .map(x => ({ path: x.path, match: x.regex.exec(this.componentRoute) }))
          .filter(x => x.match != null)
          .map(x => ({ path: x.path, match: x.match, activator: RoutingMap.viewModelMap[x.path] }))
          .firstOrDefault();

        if (result != null) {
          activator = result.activator;

          // override the routed state's match with the demo's context
          state.route.match = result.match;
        }
      }
    }

    return activator == null ? null : activator(state);
  }

  routed() {
    this.pageHeader = App.header;
  }

  saveRoutingState(state: ComponentDemoRoutingState): any {
    state.route = <Route>{
      path: `/demo/${this.componentRoute}`,
    };

    if (this.columns() !== 12) {
      state.columns = this.columns();
    }
  }

  loadRoutingState(state: ComponentDemoRoutingState) {
    // try columns routing state first, then fall back onto view model columns state
    state.columns = Object.fallback(state.columns, this.columns(), 12);

    // try and extract the component route from the routing state
    this.componentRoute = state.componentRoute || state.route.match[2];

    if (String.isNullOrEmpty(this.componentRoute) === true) {
      // if we don't have any component to route to, then try and pick a default
      const uri = RoutingMap.menus
        .asEnumerable()
        .selectMany(x => x.items.asEnumerable(), (a, b) => b.uri)
        .filter(x => String.isNullOrEmpty(x) === false)
        .firstOrDefault();

      if (String.isNullOrEmpty(uri) === false) {
        this.navTo(uri);
      }
    }
    else {
      // create the routed component
      let proposedComponent = this.getViewModel(state) as BaseRoutableViewModel<any>;

      // update columns down here since the activator could adjust columns for us
      this.columns(state.columns);

      if (proposedComponent != null && proposedComponent.setRoutingState instanceof Function) {
        // if our proposed component is a valid routable component, then update
        // the component's routing state
        proposedComponent.setRoutingState(state);
      }

      // if we have a new component then update our routed component property
      this.component(proposedComponent);
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
          Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-1`, commandParameter: 'Sidebar Section 1 Menu Item' }),
        ],
      },
      {
        id: 'sidebar-2',
        header: 'Section 2',
        items: [
          Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-1`, commandParameter: 'Sidebar Section 2 Menu Item 1' }),
          Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-2`, commandParameter: 'Sidebar Section 2 Menu Item 2' }),
        ],
      },
    ];
  }

  getNavbarMenus() {
    return RoutingMap.menus;
  }

  getNavbarActions() {
    return <HeaderCommandAction[]>[
      { id: 'reRender', header: 'Re-Render', command: this.reRender, bsStyle: 'primary' },
      Object.assign<HeaderCommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-navbar`, commandParameter: 'Navbar Action' }),
    ];
  }

  getHelpMenuItems() {
    return <HeaderMenuItem[]>[
      Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-help`, commandParameter: 'Help Menu Item' }),
    ];
  }

  getAdminMenuItems() {
    return <HeaderMenuItem[]>[
      Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-admin`, commandParameter: 'Admin Menu Item' }),
    ];
  }

  getUserMenuItems() {
    return <HeaderMenuItem[]>[
      Object.assign<HeaderMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-user`, commandParameter: 'User Menu Item' }),
    ];
  }

  getTitle() {
    let title: string;
    const component = this.component() as BaseRoutableViewModel<any>;

    if (component == null) {
      title = 'No Routed Component';
    }
    else if (typeof component === 'string') {
      title = component.toString();
    }
    else if (component.getTitle instanceof Function) {
      title = component.getTitle();
    }
    else {
      title = Object.getName(component);
    }

    return `Demo: ${title}`;
  }
}
