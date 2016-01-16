'use strict';

import * as React from 'react';

import { IViewMap } from '../RouteHandler/RouteHandlerView';

import SplashViewModel from '../Splash/SplashViewModel';
import SplashView from '../Splash/SplashView';

import ComponentDemoViewModel from '../../Demo/ComponentDemoViewModel';
import ComponentDemoView from '../../Demo/ComponentDemoView';

export let ViewMap: IViewMap = {
  SplashViewModel: (viewModel: SplashViewModel) => <SplashView viewModel={viewModel} />,
  ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />
};

export default ViewMap;
