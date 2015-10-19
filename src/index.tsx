'use strict';

// this is a bit of a hack to *ensure* that Rx is imported (as it is required by wx)
import * as Rx from 'rx';
export { Rx };

import * as React from 'react';

import App from './App';

React.render(<App/>, document.getElementById('app'));
