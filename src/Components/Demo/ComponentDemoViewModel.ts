import * as Ix from 'ix';
import * as wx from 'webrx';

import { IRoute } from '../../Routing/RouteManager';
import { ICommandAction, IMenu, IMenuItem } from '../Common/PageHeader/Actions';

import { BaseRoutableViewModel } from '../React/BaseRoutableViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { Current as App } from '../Common/App/AppViewModel';
import { Default as RoutingMap, ViewModelActivator } from './RoutingMap';

interface IComponentDemoRoutingState {
  route: IRoute;
  componentRoute: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<IComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  private pageHeader: PageHeaderViewModel = null;

  public componentRoute: string;

  public columns = wx.property(12);
  public component = wx.property<any>(null);

  public reRender = wx.command(x => {
    const state = this.routingState() || <IComponentDemoRoutingState>{};
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
        let result = Ix.Enumerable
          .fromArray(Object.keys(RoutingMap.viewModelMap))
          .where(x => x != null && x.length > 0 && x[0] === '^')
          .select(x => ({ path: x, regex: new RegExp(x, 'i') }))
          .select(x => ({ path: x.path, match: x.regex.exec(this.componentRoute) }))
          .where(x => x.match != null)
          .select(x => ({ path: x.path, match: x.match, activator: RoutingMap.viewModelMap[x.path] }))
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

  saveRoutingState(state: IComponentDemoRoutingState): any {
    state.route = <IRoute>{
      path: `/demo/${this.componentRoute}`,
    };

    if (this.columns() !== 12) {
      state.columns = this.columns();
    }
  }

  loadRoutingState(state: IComponentDemoRoutingState) {
    // try columns routing state first, then fall back onto view model columns state
    state.columns = Object.fallback(state.columns, this.columns(), 12);

    // try and extract the component route from the routing state
    this.componentRoute = state.componentRoute || state.route.match[2];

    if (String.isNullOrEmpty(this.componentRoute) === true) {
      // if we don't have any component to route to, then try and pick a default
      const uri = RoutingMap.menus
        .asEnumerable()
        .selectMany(x => x.items.asEnumerable(), (a, b) => b.uri)
        .where(x => String.isNullOrEmpty(x) === false)
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
    return <IMenu[]>[
      {
        id: 'sidebar-1',
        header: 'Section 1',
        items: [
          Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-1`, commandParameter: 'Sidebar Section 1 Menu Item' }),
        ],
      },
      {
        id: 'sidebar-2',
        header: 'Section 2',
        items: [
          Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-1`, commandParameter: 'Sidebar Section 2 Menu Item 1' }),
          Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-sidebar-2-2`, commandParameter: 'Sidebar Section 2 Menu Item 2' }),
        ],
      },
    ];
  }

  getNavbarMenus() {
    return RoutingMap.menus;
  }

  getNavbarActions() {
    return <ICommandAction[]>[
      { id: 'reRender', header: 'Re-Render', command: this.reRender, bsStyle: 'primary' },
      Object.assign<ICommandAction>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-navbar`, commandParameter: 'Navbar Action' }),
    ];
  }

  getHelpMenuItems() {
    return <IMenuItem[]>[
      Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-help`, commandParameter: 'Help Menu Item' }),
    ];
  }

  getAdminMenuItems() {
    return <IMenuItem[]>[
      Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-admin`, commandParameter: 'Admin Menu Item' }),
    ];
  }

  getUserMenuItems() {
    return <IMenuItem[]>[
      Object.assign<IMenuItem>({}, this.demoAlertItem, { id: `${ this.demoAlertItem.id }-user`, commandParameter: 'User Menu Item' }),
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
