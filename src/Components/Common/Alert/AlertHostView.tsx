import * as React from 'react';
import RTG = require('react-transition-group');
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { AlertHostViewModel } from './AlertHostViewModel';
import { AlertView } from './AlertView';
import { AlertViewModel } from './AlertViewModel';

export interface AlertHostViewProps extends BaseViewProps<AlertHostViewModel> {}

export class AlertHostView extends BaseView<
  AlertHostViewProps,
  AlertHostViewModel
> {
  public static displayName = 'AlertHostView';

  updateOn(viewModel: Readonly<AlertHostViewModel>) {
    return [viewModel.alerts.changed];
  }

  render() {
    const { className, rest } = this.restProps();

    return (
      <div {...rest} className={this.wxr.classNames('AlertHost', className)}>
        <RTG.TransitionGroup>{this.renderAlerts()}</RTG.TransitionGroup>
      </div>
    );
  }

  private renderAlerts() {
    return this.viewModel.alerts.value.map(x => (
      <RTG.CSSTransition
        key={x.key}
        classNames="alert"
        timeout={{ enter: 500, exit: 300 }}
      >
        <AlertView viewModel={x} />
      </RTG.CSSTransition>
    ));
  }
}
