'use strict';

import * as React from 'react';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import FooterView from '../Footer/FooterView';

import AppViewModel from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
}

export class AppView extends BaseView<IAppProps, any> {
	constructor(props?: IAppProps, context?: any) {
		super(props, context);

		BaseView.EnableViewRenderDebugging = this.state.EnableViewRenderDebugging;
	}

	protected getUpdateProperties(): wx.IObservableProperty<any>[] {
		return [
		];
	}

	render() {
		return (
			<div className='App'>
			</div>
		);
	}
}

export default AppView;
