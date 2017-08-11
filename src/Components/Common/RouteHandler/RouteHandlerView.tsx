import * as React from 'react';
import { Observable } from 'rxjs';
import { Grid, Alert, Breadcrumb } from 'react-bootstrap';
import RTG = require('react-transition-group');
import { Icon } from 'react-fa';

import { BaseRoutableViewModel, BaseView, BaseViewProps, isViewModel, isRoutableViewModel } from '../../React';
import { RouteHandlerViewModel, SplashKey, DefaultKey } from './RouteHandlerViewModel';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandButton } from '../CommandButton/CommandButton';
import { ViewMapper } from '../../../Routing/ViewMap';

export interface RouteHandlerProps extends BaseViewProps {
  viewMap: ViewMapper;
}

export class RouteHandlerView extends BaseView<RouteHandlerProps, RouteHandlerViewModel> {
  public static displayName = 'RouteHandlerView';

  constructor(props?: RouteHandlerProps, context?: any) {
    super(props, context);

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
    if (this.state.isLoading.value === true) {
      return SplashKey;
    }
    else {
      const component = this.state.routedComponent.value;

      if (isRoutableViewModel(component)) {
        return component.getRoutingKey();
      }
      else if (isViewModel(component)) {
        this.logger.warn('Routing to Non-Routable View Model', component);

        return component.getDisplayName();
      }
      else if (String.isString(component)) {
        return component;
      }
      else {
        return '';
      }
    }
  }

  updateOn() {
    return [
      this.state.isLoading.changed,
      this.state.routedComponent.changed,
      this.state.routingBreadcrumbs.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { viewMap } = x;
      return { viewMap };
    });

    const key = this.getViewKey();

    return (
      <div { ...rest } className={ this.classNames('RouteHandler', className) }>
        <RTG.TransitionGroup>
          <RTG.CSSTransition key={ key } classNames='view' exit={ false } timeout={ ({ enter: 250 }) }>
            <div className='RouteHandler-viewContainer'>
              <Breadcrumbs items={ this.state.routingBreadcrumbs.value } pinnable />
              { this.renderRoutedView(key) }
            </div>
          </RTG.CSSTransition>
        </RTG.TransitionGroup>
      </div>
    );
  }

  private renderRoutedView(key: string): any {
    let component = this.state.routedComponent.value;

    let activator = this.props.viewMap[key];
    if (activator == null && key !== SplashKey) {
      activator = this.props.viewMap[DefaultKey];
    }

    let view: any = activator;

    if (activator instanceof Function) {
      view = activator(component);
    }

    this.logger.debug(`Rendering routed view for '${ Object.getName(component) }' (${ key })`);

    return (
      <div className='RouteHandler-view'>
        { view || this.renderError('Catastrophic Failure') }
      </div>
    );
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
