'use strict';

import * as React from 'react';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import AlertView from '../Alert/AlertView';
import RouteHandlerView from '../RouteHandler/RouteHandlerView';

import ViewMap from './ViewMap';

import AppViewModel from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
}

export class AppView extends BaseView<IAppProps, AppViewModel> {
	constructor(props?: IAppProps, context?: any) {
		super(props, context);

		BaseView.EnableViewRenderDebugging = this.state.config.EnableViewRenderDebugging;
	}

	protected updateOn() {
		return [
			this.state.alerts.listChanged
		];
	}

	render() {
		let alerts = this.state.alerts == null ? '' : this.state.alerts.map(x => <AlertView viewModel={x} key={x.key}/>);

		return (
			<div className='App'>
				{alerts}
				<RouteHandlerView viewModel={this.state.routeHandler} viewMap={ViewMap} />
			</div>
		);
	}
}

export default AppView;
