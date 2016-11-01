import * as React from 'react';
import * as classNames from 'classnames';
import { Grid } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { ViewMap } from '../RouteHandler/RouteHandlerView';
import { AlertHostView } from '../Alert/AlertHostView';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { PageHeaderView } from '../PageHeader/PageHeaderView';
import { PageFooterView } from '../PageFooter/PageFooterView';
import { AppViewMap } from './ViewMap';
import { AppViewModel } from './AppViewModel';

import './App.less';

export interface AppProps extends BaseViewProps {
  viewMap?: ViewMap;
  brand?: any;
}

export class AppView extends BaseView<AppProps, AppViewModel> {
  public static displayName = 'AppView';

  static defaultProps = {
    viewMap: AppViewMap,
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { viewMap, brand } = x;
      return { viewMap, brand };
    });

    return (
      <div { ...rest } className={ classNames('App', className) }>
        <div className='float-container'>
          <Grid>
            <AlertHostView viewModel={ this.state.alerts } />
          </Grid>
        </div>
        <PageHeaderView viewModel={ this.state.header } brand={ props.brand } />
        <RouteHandlerView viewModel={ this.state.routeHandler } viewMap={ props.viewMap } />
        <PageFooterView viewModel={ this.state.footer } />
      </div>
    );
  }
}
