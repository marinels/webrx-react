'use strict';

import * as React from 'react';
import { Grid, PageHeader, Alert } from 'react-bootstrap';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { BaseView, IBaseViewProps } from '../../React/BaseView';

import RouteHandlerViewModel from './RouteHandlerViewModel';

import './RouteHandler.less';

export const SplashKey = 'Splash';

export interface IViewMap {
  [key: string]: any;
}

interface IRouteHandlerProps extends IBaseViewProps {
  viewMap: IViewMap;
}

export class RouteHandlerView extends BaseView<IRouteHandlerProps, RouteHandlerViewModel> {
  public static displayName = 'RouteHandlerView';

  constructor(props?: IRouteHandlerProps, context?: any) {
    super(props, context);

    if (this.props.viewMap['*'] == null) {
      this.props.viewMap['*'] = this.createError('View Not Found');
    }

    if (this.props.viewMap[''] == null) {
      this.props.viewMap[''] = this.createError('Route Not Found');
    }

    if (this.props.viewMap[SplashKey] == null) {
      this.props.viewMap[SplashKey] = null;
    }
  }

  private createError(text: string) {
    return (
      <Grid className='RouteHandler-error'>
        <Alert bsStyle='danger'>
          <h4>{text}</h4>
        </Alert>
      </Grid>
    );
  }

  private getViewKey() {
    return this.state.isLoading() === true ? SplashKey :
      this.state.currentViewModel() == null ? '' :
      this.state.currentViewModel().getRoutingKey();
  }

  private getView(key: string): any {
    let viewModel = this.state.currentViewModel();

    let activator = this.props.viewMap[key];
    if (activator == null && key !== SplashKey) {
      activator = this.props.viewMap['*'];
    }

    let view: any = activator;

    if (activator instanceof Function) {
      view = activator(viewModel);
    }

    return view;
  }

  updateOn() {
    return [
      this.state.currentViewModel.changed
    ];
  }

  render() {
    let key = this.getViewKey();
    let view = this.getView(key) || 'Catastrophic Failure';

    return (
      <div className='RouteHandler'>
        <ReactCSSTransitionGroup transitionName='view' transitionLeave={false} transitionEnterTimeout={250}>
          <div className='RouteHandler-viewContainer' key={key}>
            { view }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default RouteHandlerView;
