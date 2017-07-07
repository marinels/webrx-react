import * as React from 'react';
import { render } from 'react-dom';

// import our namespaced bootstrap styles
import './Style/Bootstrap.less';

// import framework API surface
import './webrx-react';

// import the App view and view model
import { AppViewModel, AppView } from './Components';

// grab the DOM entry point
const container = document.getElementById('app');

if (container) {
  render(
    <AppView viewModel={ new AppViewModel(true, true, true) } alerts header footer
      copyright='WebRx-React' copyrightUri='https://github.com/marinels/webrx-react'
      footerContent={
        (
          <span>
            { 'Powered by ' }
            <a href='https://www.typescriptlang.org/'>TypeScript</a>
            { ', ' }
            <a href='https://facebook.github.io/react/'>React</a>
            { ', ' }
            <a href='http://reactivex.io/rxjs/'>RxJS</a>
          </span>
        )
      }
    />,
    container,
  );
}
