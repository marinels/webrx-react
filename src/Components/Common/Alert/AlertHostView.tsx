import * as React from 'react';
import * as classNames from 'classnames';
import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { AlertView } from './AlertView';
import { AlertHostViewModel } from './AlertHostViewModel';

import './AlertHost.less';

export interface AlertHostProps extends BaseViewProps {
}

export class AlertHostView extends BaseView<AlertHostProps, AlertHostViewModel> {
  public static displayName = 'AlertHostView';

  updateOn() {
    return [
      this.state.alerts.listChanged,
    ];
  }

  render() {
    const { className, rest } = this.restProps();

    return (
      <div { ...rest } className={ classNames('AlertHost', className) }>
        <ReactCSSTransitionGroup transitionName='alert' transitionEnterTimeout={ 500 } transitionLeaveTimeout={ 300 }>
          { this.renderAlerts() }
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  private renderAlerts() {
    return this.state.alerts
      .map(x => (
        <AlertView viewModel={ x } key={ x.key } />
      ));
  }
}
