'use strict';

import * as Ix from 'ix';
import * as wx from 'webrx';

import { IRoute } from '../../Routing/RouteManager';
import { ICommandAction, IMenu } from '../Common/PageHeader/Actions';

import { BaseRoutableViewModel, IBaseRoutableViewModel, IRoutedViewModel } from '../React/BaseRoutableViewModel';
import { PageHeaderViewModel } from '../Common/PageHeader/PageHeaderViewModel';
import { Default as RoutingMap, IViewModelActivator } from './RoutingMap';

interface IComponentDemoRoutingState {
  route: IRoute;
  componentRoute: string;
  columns: number;
}

export class ComponentDemoViewModel extends BaseRoutableViewModel<IComponentDemoRoutingState> {
  public static displayName = 'ComponentDemoViewModel';

  constructor() {
    super(true);
  }

  public componentRoute: string;

  public columns = wx.property(12);
  public component = wx.property<any>(null);

  private pageHeader: PageHeaderViewModel = null;

  public reRender = wx.command(x => {
    this.navTo(`/demo/${this.componentRoute}?rand=${Math.random()}`);
  });

  componentRouted(pageHeader: PageHeaderViewModel) {
    this.pageHeader = pageHeader;
  }

  getSearch() {
    let viewModel = <IBaseRoutableViewModel>this.component();

    return (viewModel != null && viewModel.getSearch != null) ? viewModel.getSearch() : null;
  }

  getAppMenus() {
    return <IMenu[]>[
      { id: 'demos', header: 'Component Demos', items: RoutingMap.menuItems },
    ];
  }

  getAppActions() {
    return <ICommandAction[]>[
      { id: 'reRender', header: 'Re-Render', command: this.reRender, bsStyle: 'primary' },
    ];
  }

  private getViewModel(componentRoute: string, state: any) {
    let activator: IViewModelActivator = null;

    if (componentRoute != null) {
      this.logger.debug(`Loading View Model for "${componentRoute}"...`);
      activator = RoutingMap.map[componentRoute];

      if (activator == null) {
        let result = Ix.Enumerable
          .fromArray(Object.keys(RoutingMap.map))
          .where(x => x != null && x.length > 0 && x[0] === '^')
          .select(x => ({ path: x, regex: new RegExp(x, 'i') }))
          .select(x => ({ path: x.path, match: x.regex.exec(componentRoute) }))
          .where(x => x.match != null)
          .select(x => ({ path: x.path, match: x.match, activator: RoutingMap.map[x.path] }))
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

  initialize() {
    super.initialize();

    this.subscribe(wx
      .whenAny(this.columns.changed, x => null)
      .invokeCommand(this.routingStateChanged)
    );

    this.subscribe(this.component.changed
      .subscribe(x => {
        this.pageHeader.updateDynamicContent();
      })
    );
  }

  saveRoutingState(state: IComponentDemoRoutingState): any {
    state.route = <IRoute>{
      path: `/demo/${this.componentRoute}`
    };

    if (this.columns() !== 12) {
      state.columns = this.columns();
    }

    super.saveRoutingState(state);
  }

  setRoutingState(state: IComponentDemoRoutingState) {
    this.componentRoute = state.componentRoute || state.route.match[2];

    if (this.componentRoute == null) {
      if (RoutingMap.menuItems.length > 0) {
        this.navTo(RoutingMap.menuItems[0].uri);
      }
    } else {
      super.setRoutingState(state);
    }
  }

  loadRoutingState(state: IComponentDemoRoutingState) {
    // try columns routing state first, then fall back onto view model columns state
    state.columns = state.columns != null ? state.columns : this.columns();

    let component = this.getViewModel(this.componentRoute, state) as IRoutedViewModel;

    let isNewComponent = this.component() == null || this.component() !== component ||
      (component.getDisplayName == null ? component.toString() : component.getDisplayName()) !==
      (this.component().getDisplayName == null ? this.component().toString() : this.component().getDisplayName());

    if (isNewComponent === false) {
      component = this.component();
    }

    // update columns down here since the activator could adjust columns for us
    this.columns(state.columns == null ? 12 : state.columns);

    if (component != null && component.setRoutingState) {
      component.setRoutingState(state);
    }

    if (isNewComponent) {
      this.component(component);
    }

    super.loadRoutingState(state);
  }
}

export default ComponentDemoViewModel;
