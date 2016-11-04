import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import all custom styles
import './Style/App.less';

// import framework API surface
import * as wxr from './webrx-react';

// grab the DOM entry point
const container = document.getElementById('app');

if (container) {
  const { AppView } = wxr.Components;

  ReactDOM.render(
    <AppView viewModel={ new wxr.Components.AppViewModel() } copyright='webrx-react' />,
    container
  );
}
