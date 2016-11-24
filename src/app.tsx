import * as React from 'react';
import { render } from 'react-dom';

// import all custom styles
import './Style/App.less';

// import framework API surface
import './webrx-react';

// import the App view and view model
import { AppViewModel, AppView } from './Components';

// grab the DOM entry point
const container = document.getElementById('app');

if (container) {
  render(
    <AppView viewModel={ new AppViewModel() } copyright='WebRx-React' />,
    container
  );
}
