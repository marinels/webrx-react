import * as React from 'react';
import * as classNames from 'classnames';
import { CSSTransitionGroup } from 'react-transition-group';

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
      this.state.alerts.changed,
    ];
  }

  render() {
    const { className, rest } = this.restProps();

    return (
      <div { ...rest } className={ classNames('AlertHost', className) }>
        <CSSTransitionGroup transitionName='alert' transitionEnterTimeout={ 500 } transitionLeaveTimeout={ 300 }>
          { this.renderAlerts() }
        </CSSTransitionGroup>
      </div>
    );
  }

  private renderAlerts() {
    return this.state.alerts.value
      .map(x => (
        <AlertView viewModel={ x } key={ x.key } />
      ));
  }
}
