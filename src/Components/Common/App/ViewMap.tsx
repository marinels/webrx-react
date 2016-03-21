'use strict';

import * as React from 'react';

import { IViewMap } from '../RouteHandler/RouteHandlerView';

import Splash from '../Splash/Splash';

import ComponentDemoViewModel from '../../Demo/ComponentDemoViewModel';
import ComponentDemoView from '../../Demo/ComponentDemoView';

export default {
  Splash: () => <Splash header='WebRx.React' />,
  ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />
} as IViewMap;
