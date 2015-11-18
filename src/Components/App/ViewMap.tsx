'use strict';

import * as React from 'react';

import { IViewMap } from '../Common/RouteHandler/RouteHandlerView';

import DashboardViewModel from '../Dashboard/DashboardViewModel';
import DashboardView from '../Dashboard/DashboardView';

export let ViewMap: IViewMap = {
  DashboardViewModel: (viewModel: DashboardViewModel) => <DashboardView viewModel={viewModel} />
};

export default ViewMap;
