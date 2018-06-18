import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';

// import our namespaced bootstrap styles
import './Style/Bootstrap.less';

// import framework API surface
import './webrx-react';

// import the App view and view model
import { AppView, AppViewModel } from './Components';

// import the demos
import './Components/Demo';

// grab the DOM entry point
const container = document.getElementById('app');

let app: AppViewModel;

function renderApp(newViewModel = false) {
  const Components: { AppView: typeof AppView, AppViewModel: typeof AppViewModel } = require('./Components');

  app = (newViewModel || app == null) ? new AppViewModel(true, true, true) : app;

  return (
    <Components.AppView
      viewModel={ app }
      alerts
      header
      footer
      copyright='webrx-react'
      copyrightUri='https://github.com/marinels/webrx-react'
      footerContent={
        (
          <span>
            { 'Powered by ' }
            <a href='https://www.typescriptlang.org/'>TypeScript</a>
            { ', ' }
            <a href='https://facebook.github.io/react/'>React</a>
            { ', and ' }
            <a href='http://reactivex.io/rxjs/'>RxJS</a>
          </span>
        )
      }
    />
  );
}

function renderAppContainer(newViewModel = false): any {
  if (WEBPACK_DEV_SERVER) {
    return (
      <AppContainer>
        { renderApp(newViewModel) }
      </AppContainer>
    );
  }

  return renderApp(newViewModel);
}

if (container) {
  render(renderAppContainer(), container);
}

if (WEBPACK_DEV_SERVER) {
  if (module.hot) {
    module.hot.accept(
      [
        './webrx-react',
        './Components',
        './Components/Demo',
      ],
      (ids) => {
        const newViewModel = ids.some(x => String.isString(x) && x.toLowerCase().indexOf('viewmodel') >= 0);
        render(renderAppContainer(newViewModel), container);
      },
    );
  }
}
