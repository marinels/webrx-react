'use strict';

import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';

import ModalDialogViewModel from './ModalDialogViewModel';

interface IModalDialogProps extends IBaseViewProps {
  acceptText?: string;
  cancelText?: string;
  children?: any;
}

export class ModalDialogView extends BaseView<IModalDialogProps, ModalDialogViewModel> {
  public static displayName = 'ModalDialogView';

  updateOn() {
    return [
      this.state.title.changed,
      this.state.cancelText.changed,
      this.state.acceptText.changed,
      this.state.result.changed,
      this.state.accept.canExecuteObservable
        .debounce(100)
        .distinctUntilChanged()
    ]
  }

  render() {
    let header = String.isNullOrEmpty(this.state.title()) ? null : (
      <Modal.Header closeButton>
        <Modal.Title>{this.state.title()}</Modal.Title>
      </Modal.Header>
    );

    let body = React.Children.count(this.props.children) === 0 ? null : (
      <Modal.Body>
        {this.props.children}
      </Modal.Body>
    );

    return (
      <div className='ModalDialogView'>
        <Modal show={this.state.result() == null} onHide={() => this.state.cancel.execute(null)} autoFocus keyboard>
          {header}
          {body}
          <Modal.Footer>
            <Button onClick={this.bindEvent(x => x.cancel)}>{this.props.cancelText || this.state.cancelText()}</Button>
            <Button
              disabled={this.state.accept.canExecute(null) === false}
              onClick={this.bindEvent(x => x.accept)} bsStyle='primary'>{this.props.acceptText || this.state.acceptText()}</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default ModalDialogView;
