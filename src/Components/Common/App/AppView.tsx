import * as React from 'react';
import * as classNames from 'classnames';
import { Grid } from 'react-bootstrap';

import { BootstrapGuide } from './BootstrapGuide';
import { BaseView } from '../../React/BaseView';
import { Splash } from '../Splash/Splash';
import { AlertHostView } from '../Alert/AlertHostView';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { PageHeaderView, PageHeaderProps } from '../PageHeader/PageHeaderView';
import { PageFooterView, PageFooterProps } from '../PageFooter/PageFooterView';
import { AppViewModel } from './AppViewModel';
import { ViewMap, ViewMapper } from '../../../Routing/ViewMap';

import './App.less';

ViewMap['Splash'] = () => (
  <Splash header='WebRx-React' />
);

export interface AppProps extends PageHeaderProps, PageFooterProps {
  viewMap?: ViewMapper;
  guide?: boolean;
}

export class AppView extends BaseView<AppProps, AppViewModel> {
  public static displayName = 'AppView';

  static defaultProps = {
    viewMap: ViewMap,
    guide: DEBUG,
  };

  updateOn() {
    return [
      this.state.isLoading.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { viewMap, guide, brand, copyright } = x;
      return { viewMap, guide, brand, copyright };
    });

    return (
      <div { ...rest } className={ classNames('App', className) }>
        {
          this.renderConditional(this.state.isLoading, () => (
            <div className='preload'>
              <i className='fa fa-spinner fa-5x fa-pulse' aria-hidden='true'></i>
            </div>
          ), () => (
            <div>
              <BootstrapGuide visible={ props.guide } />
              <div className='float-container'>
                <Grid>
                  <AlertHostView viewModel={ this.state.alerts } />
                </Grid>
              </div>
              <PageHeaderView viewModel={ this.state.header } brand={ props.brand } />
              <RouteHandlerView viewModel={ this.state.routeHandler } viewMap={ props.viewMap } />
              <PageFooterView viewModel={ this.state.footer } copyright={ props.copyright } />
            </div>
          ))
        }
      </div>
    );
  }
}
