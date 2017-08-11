import * as React from 'react';
import { Observable } from 'rxjs';
import RTG = require('react-transition-group');

import { BaseView, BaseViewProps } from '../../React';
import { AlertView } from './AlertView';
import { AlertHostViewModel } from './AlertHostViewModel';
import { AlertViewModel } from './AlertViewModel';

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
      <div { ...rest } className={ this.classNames('AlertHost', className) }>
        <RTG.TransitionGroup>
          { this.renderAlerts() }
        </RTG.TransitionGroup>
      </div>
    );
  }

  private renderAlerts() {
    return this.state.alerts.value
      .map(x => (
        <RTG.CSSTransition key={ x.key } classNames='alert' timeout={ ({ enter: 500, exit: 300 }) }>
          <AlertView viewModel={ x } />
        </RTG.CSSTransition>
      ));
  }
}
