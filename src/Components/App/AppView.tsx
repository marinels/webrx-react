'use strict';

import * as React from 'react';
import * as moment from 'moment';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import AlertView from '../Alert/AlertView';

import AppViewModel from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
}

export class AppView extends BaseView<IAppProps, AppViewModel> {
	constructor(props?: IAppProps, context?: any) {
		super(props, context);

		BaseView.EnableViewRenderDebugging = this.state.config.EnableViewRenderDebugging;
	}

	protected updateFor() {
		return [
			this.state.alerts.listChanged
		];
	}

	render() {
		let alerts = this.state.alerts == null ? '' : this.state.alerts.map(x => <AlertView viewModel={x} key={x.key}/>);

		return (
			<div className='App'>
				<div onClick={x => this.state.appendAlert(moment().format(), 'test')}>[Test Area]</div>
				{alerts}
			</div>
		);
	}
}

export default AppView;
