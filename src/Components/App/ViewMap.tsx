'use strict';

import * as React from 'react';

import { IViewMap } from '../Common/RouteHandler/RouteHandlerView';

import DashboardViewModel from '../Dashboard/DashboardViewModel';
import DashboardView from '../Dashboard/DashboardView';

import SplashViewModel from '../Common/Splash/SplashViewModel';
import SplashView from '../Common/Splash/SplashView';

// import ComponentDemoViewModel from '../Demo/ComponentDemoViewModel';
// import ComponentDemoView from '../Demo/ComponentDemoView';

export let ViewMap: IViewMap = {
  DashboardViewModel: (viewModel: DashboardViewModel) => <DashboardView viewModel={viewModel} />,
  SplashViewModel: (viewModel: SplashViewModel) => <SplashView viewModel={viewModel} />,
  // ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />
};

export default ViewMap;
