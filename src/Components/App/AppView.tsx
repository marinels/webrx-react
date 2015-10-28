'use strict';

import * as React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import AlertView from '../Alert/AlertView';
import RouteHandlerView from '../RouteHandler/RouteHandlerView';
import PageHeaderView from '../PageHeader/PageHeaderView';
import PageFooterView from '../PageFooter/PageFooterView';

import ViewMap from './ViewMap';

import AppViewModel from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
}

export class AppView extends BaseView<IAppProps, AppViewModel> {
	constructor(props?: IAppProps, context?: any) {
		super(props, context);

		BaseView.EnableViewDebugging = this.state.config.EnableViewDebugging;
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
				<Grid>
					<Row>
						<Col md={12}>
							{alerts}
						</Col>
					</Row>
				</Grid>
				<PageHeaderView viewModel={this.state.header} />
				<RouteHandlerView viewModel={this.state.routeHandler} viewMap={ViewMap} />
				<PageFooterView viewModel={this.state.footer} />
			</div>
		);
	}
}

export default AppView;
