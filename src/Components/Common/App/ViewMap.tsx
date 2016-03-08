'use strict';

import * as React from 'react';

import { IViewMap } from '../RouteHandler/RouteHandlerView';

import ComponentDemoViewModel from '../../Demo/ComponentDemoViewModel';
import ComponentDemoView from '../../Demo/ComponentDemoView';

export let ViewMap: IViewMap = {
  ComponentDemoViewModel: (viewModel: ComponentDemoViewModel) => <ComponentDemoView viewModel={viewModel} />
};

export default ViewMap;
