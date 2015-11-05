'use strict';

import * as React from 'react';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import RouteHandlerViewModel from './RouteHandlerViewModel';

import './RouteHandler.less';

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
      this.props.viewMap['*'] = 'View Not Found';
    }

    if (this.props.viewMap[''] == null) {
      this.props.viewMap[''] = 'Route Not Found';
    }
  }

  private getView(): any {
    let viewModel = this.state.currentViewModel();
    let key = viewModel == null ? '' : viewModel.getRoutingKey();

    let activator = this.props.viewMap[key];
    if (activator == null) {
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
    let view = this.getView() || 'Catastrophic Failure';
    return (
      <div className='RouteHandler'>
        <ReactCSSTransitionGroup transitionName='view' transitionLeave={false} transitionEnterTimeout={250}>
          <div className='RouteHandler-viewContainer' key={view}>
            { view }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

export default RouteHandlerView;
