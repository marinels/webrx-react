'use strict';

import * as React from 'react';

import { IViewMap } from '../Common/RouteHandler/RouteHandlerView';

import DashboardViewModel from '../Dashboard/DashboardViewModel';
import DashboardView from '../Dashboard/DashboardView';

// import ComponentDemoViewModel from '../Demo/ComponentDemoViewModel';
// import ComponentDemoView from '../Demo/ComponentDemoView';

export let ViewMap: IViewMap = {
  DashboardViewModel: (viewModel: DashboardViewModel) => <DashboardView viewModel={viewModel} />,
  // ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />
};

export default ViewMap;
