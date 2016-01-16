'use strict';

import * as React from 'react';

import SplashViewModel from '../Common/Splash/SplashViewModel';
import SplashView from '../Common/Splash/SplashView';

export interface IViewActivator {
  (component: any): any;
}

export interface IViewMap {
  [key: string]: IViewActivator;
}

let viewMap: IViewMap = {
  SplashViewModel: (viewModel: SplashViewModel) => <SplashView viewModel={viewModel} fluid />,
};

export default viewMap;
