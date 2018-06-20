import * as React from 'react';
import { Alert, Grid } from 'react-bootstrap';
import RTG = require('react-transition-group');
import { Observable } from 'rxjs';

import { ViewMapper } from '../../../Routing';
import {
  BaseView,
  BaseViewProps,
  isRoutableViewModel,
  isViewModel,
} from '../../React';
import { Breadcrumbs } from './Breadcrumbs';
import {
  DefaultKey,
  RouteHandlerViewModel,
  SplashKey,
} from './RouteHandlerViewModel';

export interface RouteHandlerProps {
  viewMap: ViewMapper;
  responsive?: boolean;
}

export interface RouteHandlerViewProps
  extends BaseViewProps<RouteHandlerViewModel>,
    RouteHandlerProps {}

export class RouteHandlerView extends BaseView<
  RouteHandlerViewProps,
  RouteHandlerViewModel
> {
  public static displayName = 'RouteHandlerView';

  constructor(props: any) {
    super(props);

    if (this.props.viewMap[DefaultKey] == null) {
      this.props.viewMap[DefaultKey] = () => this.renderError('View Not Found');
    }

    if (this.props.viewMap[''] == null) {
      this.props.viewMap[''] = () => this.renderError('Route Not Found');
    }

    if (this.props.viewMap[SplashKey] == null) {
      this.props.viewMap[SplashKey] = null;
    }
  }

  private getViewKey() {
    if (this.viewModel.isLoading.value === true) {
      return SplashKey;
    } else {
      const component = this.viewModel.routedComponent.value;

      if (isRoutableViewModel(component)) {
        return component.getRoutingKey();
      } else if (isViewModel(component)) {
        this.logger.warn('Routing to Non-Routable View Model', component);

        return component.getDisplayName();
      } else if (String.isString(component)) {
        return component;
      } else {
        return '';
      }
    }
  }

  updateOn(viewModel: Readonly<RouteHandlerViewModel>) {
    return [
      viewModel.isLoading.changed,
      viewModel.routedComponent.changed,
      viewModel.routingBreadcrumbs.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { viewMap, responsive } = x;
      return { viewMap, responsive };
    });

    const key = this.getViewKey();

    return (
      <div {...rest} className={this.wxr.classNames('RouteHandler', className)}>
        <RTG.TransitionGroup>
          <RTG.CSSTransition
            key={key}
            classNames="view"
            exit={false}
            timeout={{ enter: 250 }}
          >
            <div className="RouteHandler-viewContainer">
              <Breadcrumbs
                items={this.viewModel.routingBreadcrumbs.value}
                pinnable
              />
              {this.renderRoutedView(key)}
            </div>
          </RTG.CSSTransition>
        </RTG.TransitionGroup>
      </div>
    );
  }

  private renderRoutedView(key: string): any {
    const component = this.viewModel.routedComponent.value;

    let activator = this.props.viewMap[key];
    if (activator == null && key !== SplashKey) {
      activator = this.props.viewMap[DefaultKey];
    }

    let view: any = activator;

    if (activator instanceof Function) {
      view = activator(component, this.props.responsive);
    }

    this.logger.debug(
      `Rendering routed view for '${Object.getName(component)}' (${key})`,
    );

    return (
      <div className="RouteHandler-view">
        {view || this.renderError('Catastrophic Failure')}
      </div>
    );
  }

  private renderError(text: string) {
    return (
      <Grid className="RouteHandler-error">
        <Alert bsStyle="danger">
          <h4>{text}</h4>
        </Alert>
      </Grid>
    );
  }
}
