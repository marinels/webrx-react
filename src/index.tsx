'use strict';

// this is a bit of a hack to *ensure* that Rx is imported (as it is required by wx)
import * as Rx from 'rx';
export { Rx };

import * as React from 'react';

import AppView from './App/AppView';
import AppViewModel from './App/AppViewModel';

let container = document.getElementById('app');

if (container) {
  let viewModel = new AppViewModel();
  viewModel.EnableViewRenderDebugging = true;

  React.render(<AppView viewModel={viewModel}/>, document.getElementById('app'));
}
