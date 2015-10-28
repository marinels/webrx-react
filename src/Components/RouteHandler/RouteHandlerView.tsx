'use strict';

import * as React from 'react';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import RouteHandlerViewModel from './RouteHandlerViewModel';

export interface IViewMap {
  [key: string]: any;
}

interface IRouteHandlerProps extends IBaseViewProps {
  viewMap: IViewMap;
}

export class RouteHandlerView extends BaseView<IRouteHandlerProps, RouteHandlerViewModel> {
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
    return (
      <div className='RouteHandler'>
        {this.getView()}
      </div>
    );
  }
}

export default RouteHandlerView;
