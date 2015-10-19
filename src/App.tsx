'use strict';

import * as React from 'react';

import BaseView from './React/BaseView';
import TestViewModel from './Test/TestViewModel';
import TestView from './Test/TestView';

BaseView.EnableViewDebugging = true;

export default class App extends React.Component<any, any> {
	private TestVM = new TestViewModel();

	render() {
		return (
			<TestView viewModel={this.TestVM} />
		);
	}
}
