import * as React from 'react';
import { Modal, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';

import { ModalDialogViewModel } from './ModalDialogViewModel';

interface IModalDialogProps extends IBaseViewProps {
  acceptText?: string;
  cancelText?: string;
  children?: any;
  content?: any;
}

export class ModalDialogView extends BaseView<IModalDialogProps, ModalDialogViewModel<any>> {
  public static displayName = 'ModalDialogView';

  updateOn() {
    return [
      this.state.title.changed,
      this.state.cancelText.changed,
      this.state.acceptText.changed,
      this.state.isVisible.changed,
      this.state.accept.canExecuteObservable,
    ];
  }

  render() {
    let content: any = null;

    // don't render any content if the modal is hidden
    if (this.state.isVisible()) {
      let header = String.isNullOrEmpty(this.state.title()) ? null : (
        <Modal.Header closeButton>
          <Modal.Title>{this.state.title()}</Modal.Title>
        </Modal.Header>
      );

      let body = this.props.content || this.props.children || this.state.content;

      if (body instanceof Function) {
        body = body.apply(this, [this.state]);
      }

      content = (
        <div className='ModalDialogView'>
          <Modal show={this.state.isVisible()} onHide={() => this.state.hide.execute(null)} autoFocus keyboard>
            {header}
            {body == null ? null : (
              <Modal.Body>{body}</Modal.Body>
            )}
            <Modal.Footer>
              <Button onClick={this.bindEventToCommand(x => x.cancel)}>
                {this.props.cancelText || this.state.cancelText()}
              </Button>
              <Button
                disabled={this.state.accept.canExecute(null) === false}
                onClick={this.bindEventToCommand(x => x.accept)} bsStyle='primary'>
                {this.props.acceptText || this.state.acceptText()}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }

    return (
      <div className='ModalDialogView'>{content}</div>
    );

  }
}
