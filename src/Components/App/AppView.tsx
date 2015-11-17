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

  constructor(props?: IAppProps, context?: any) {
    super(props, context);

    BaseView.EnableViewDebugging = this.state.config.EnableViewDebugging;
  }

  render() {
    return (
      <div className='App'>
        <PageHeaderView viewModel={this.state.header} />
        <Grid>
          <Row>
            <Col md={12}>
              <AlertHostView viewModel={this.state.alerts} />
            </Col>
          </Row>
        </Grid>
        <RouteHandlerView viewModel={this.state.routeHandler} viewMap={ViewMap} />
        <PageFooterView viewModel={this.state.footer} />
      </div>
    );
  }
}

export default AppView;
