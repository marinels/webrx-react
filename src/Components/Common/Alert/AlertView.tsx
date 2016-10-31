import * as React from 'react';
import { Alert } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { AlertViewModel } from './AlertViewModel';

import './Alert.less';

export interface AlertProps extends BaseViewProps {
  key?: any;
}

export class AlertView extends BaseView<AlertProps, AlertViewModel> {
  public static displayName = 'AlertView';

  render() {
    return (
      <div className='Alert'>
        <Alert bsStyle={this.state.style} onDismiss={this.bindEventToCommand(x => x.dismiss)}>
          <h4>{this.state.header}</h4>
          <span className='Alert-text' dangerouslySetInnerHTML={{__html: this.state.content}}></span>
        </Alert>
      </div>
    );
  }
}
