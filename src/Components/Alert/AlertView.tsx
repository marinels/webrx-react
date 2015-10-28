'use strict';

import * as Rx from 'rx';
import * as React from 'react';

import { Fade, Alert } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import AlertViewModel from './AlertViewModel';

import './Alert.less';

interface IAlertProps extends IBaseViewProps {
  key?: any;
  timeout?: number;
}

export class AlertView extends BaseView<IAlertProps, AlertViewModel> {
  private showAlertIfNotVisible() {
    if (this.state.isVisible() == null) {
      Rx.Observable.return(true).delay(10).invokeCommand(this.state.show);
    }
  }

  updateOn() {
    return [
      this.state.isVisible.changed
    ]
  }

  render() {
    this.showAlertIfNotVisible();

    return (
      <div className='Alert'>
        <Fade timeout={this.props.timeout || 500} in={this.state.isVisible()} onDismiss={this.bindEvent(x => x.dismiss)}>
          <Alert bsStyle={this.state.style}>
            <h4>{this.state.header}</h4>
            {this.state.text}
          </Alert>
        </Fade>
      </div>
    );
  }
}

export default AlertView;
