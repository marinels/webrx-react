'use strict';

import * as Rx from 'rx';
import * as React from 'react';

import { Fade, Alert } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import AlertViewModel from './AlertViewModel';

import './Alert.less';

interface IAlertProps extends IBaseViewProps {
  key?: any;
}

export class AlertView extends BaseView<IAlertProps, AlertViewModel> {
  public static displayName = 'AlertView';

  render() {
    return (
      <div className='Alert'>
        <Alert bsStyle={this.state.style} onDismiss={this.bindEvent(x => x.dismiss)}>
          <h4>{this.state.header}</h4>
          {this.state.text}
        </Alert>
      </div>
    );
  }
}

export default AlertView;
