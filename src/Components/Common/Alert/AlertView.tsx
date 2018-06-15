import * as React from 'react';
import { Alert } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { AlertViewModel } from './AlertViewModel';

export interface AlertViewProps extends BaseViewProps<AlertViewModel> {
}

export class AlertView extends BaseView<AlertViewProps, AlertViewModel> {
  public static displayName = 'AlertView';

  render() {
    const { className, rest } = this.restProps();

    return (
      <div { ...rest } className={ this.wxr.classNames('Alert', className) }>
        <Alert bsStyle={ this.viewModel.style } onDismiss={ this.bindEventToCommand(x => x.dismiss) }>
          <div className='Alert-header'>{ this.viewModel.header }</div>
          { this.renderAlertContent() }
        </Alert>
      </div>
    );
  }

  private renderAlertContent() {
    return this.wxr.renderConditional(
      String.isString(this.viewModel.content),
      () => (
        <div className='Alert-content'>
          <div className='Alert-text' dangerouslySetInnerHTML={ { __html: this.viewModel.content } } />
        </div>
      ),
      () => this.viewModel.content,
    );
  }
}
