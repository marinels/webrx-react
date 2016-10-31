import * as React from 'react';

import { ViewMap } from '../RouteHandler/RouteHandlerView';
import { Splash } from '../Splash/Splash';
import { ComponentDemoViewModel } from '../../Demo/ComponentDemoViewModel';
import { ComponentDemoView } from '../../Demo/ComponentDemoView';

export const AppViewMap = {
  Splash: () => <Splash header='WebRx.React' />,
  ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />,
} as ViewMap;
