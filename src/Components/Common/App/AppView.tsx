import * as React from 'react';

import { Grid } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { IViewMap } from '../RouteHandler/RouteHandlerView';
import { AlertHostView } from '../Alert/AlertHostView';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { PageHeaderView } from '../PageHeader/PageHeaderView';
import { PageFooterView } from '../PageFooter/PageFooterView';

import { ViewMap } from './ViewMap';

import { AppViewModel } from './AppViewModel';

import './App.less';

interface IAppProps extends IBaseViewProps {
  viewMap?: IViewMap;
  brand?: any;
}

export class AppView extends BaseView<IAppProps, AppViewModel> {
  public static displayName = 'AppView';

  static defaultProps = {
    viewMap: ViewMap,
  };

  render() {
    return (
      <div className='App'>
        <div className='float-container'>
          <Grid>
            <AlertHostView viewModel={this.state.alerts} />
          </Grid>
        </div>
        <PageHeaderView viewModel={this.state.header} brand={this.props.brand} />
        <RouteHandlerView viewModel={this.state.routeHandler} viewMap={this.props.viewMap} />
        <PageFooterView viewModel={this.state.footer} />
      </div>
    );
  }
}
