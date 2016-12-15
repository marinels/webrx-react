import * as React from 'react';
import { Grid, Alert } from 'react-bootstrap';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as classNames from 'classnames';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { RouteHandlerViewModel, SplashKey } from './RouteHandlerViewModel';
import { ViewMapper } from '../../../Routing/ViewMap';

import './RouteHandler.less';

export interface RouteHandlerProps extends BaseViewProps {
  viewMap: ViewMapper;
}

export class RouteHandlerView extends BaseView<RouteHandlerProps, RouteHandlerViewModel> {
  public static displayName = 'RouteHandlerView';

  constructor(props?: RouteHandlerProps, context?: any) {
    super(props, context);

    if (this.props.viewMap['*'] == null) {
      this.props.viewMap['*'] = () => this.renderError('View Not Found');
    }

    if (this.props.viewMap[''] == null) {
      this.props.viewMap[''] = () => this.renderError('Route Not Found');
    }

    if (this.props.viewMap[SplashKey] == null) {
      this.props.viewMap[SplashKey] = null;
    }
  }

  private getViewKey() {
    return this.state.isLoading() === true ? SplashKey :
      this.state.currentViewModel() == null ? '' :
      this.state.currentViewModel().getRoutingKey();
  }

  updateOn() {
    return [
      this.state.isLoading.changed,
      this.state.currentViewModel.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { viewMap } = x;
      return { viewMap };
    });

    const key = this.getViewKey();

    return (
      <div { ...rest } className={ classNames('RouteHandler', className) }>
        <ReactCSSTransitionGroup transitionName='view' transitionLeave={ false } transitionEnterTimeout={ 250 }>
          <div className='RouteHandler-viewContainer' key={ key }>
            { this.renderRoutedView(key) }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  private renderRoutedView(key: string): any {
    let viewModel = this.state.currentViewModel();

    let activator = this.props.viewMap[key];
    if (activator == null && key !== SplashKey) {
      activator = this.props.viewMap['*'];
    }

    let view: any = activator;

    if (activator instanceof Function) {
      view = activator(viewModel);
    }

    this.logger.debug(`Rendering routed view for '${ Object.getName(viewModel) }' (${ key })`);

    return view || 'Catastrophic Failure';
  }

  private renderError(text: string) {
    return (
      <Grid className='RouteHandler-error'>
        <Alert bsStyle='danger'>
          <h4>{ text }</h4>
        </Alert>
      </Grid>
    );
  }
}
