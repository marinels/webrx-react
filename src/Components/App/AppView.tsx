'use strict';

import * as React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';
import AlertHostView from '../Common/Alert/AlertHostView';
import RouteHandlerView from '../Common/RouteHandler/RouteHandlerView';
import PageHeaderView from '../Common/PageHeader/PageHeaderView';
import PageFooterView from '../Common/PageFooter/PageFooterView';

import ViewMap from './ViewMap';

import AppViewModel from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
}

export class AppView extends BaseView<IAppProps, AppViewModel> {
  public static displayName = 'AppView';

  render() {
    return (
      <div className='App'>
        <div className='float-container'>
          <Grid>
            <AlertHostView viewModel={this.state.alerts} />
          </Grid>
        </div>
        <PageHeaderView viewModel={this.state.header} />
        <RouteHandlerView viewModel={this.state.routeHandler} viewMap={ViewMap} />
        <PageFooterView viewModel={this.state.footer} />
      </div>
    );
  }
}

export default AppView;
