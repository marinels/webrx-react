import * as React from 'react';
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
    let alerts = this.state.alerts == null ? null : this.state.alerts.map(x => <AlertView viewModel={x} key={x.key}/>);

    return (
      <div className='AlertHost'>
        <ReactCSSTransitionGroup transitionName='alert' transitionEnterTimeout={500} transitionLeaveTimeout={300}>
          { alerts }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
