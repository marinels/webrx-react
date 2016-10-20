import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { BaseView, IBaseViewProps } from '../../React/BaseView';

import { ModalDialogViewModel } from './ModalDialogViewModel';

import './ModalDialog.less';

interface ModalDialogProps extends IBaseViewProps {
  title: any;
  body?: any;
  noClose?: boolean;
  children?: any;
}

export class ModalDialogView extends BaseView<ModalDialogProps, ModalDialogViewModel> {
  public static displayName = 'ModalDialogView';

  static defaultProps = {
    noClose: false,
  };

  updateOn() {
    return [
      this.state.isVisible.changed,
    ];
  }

  render() {
    return this.renderConditional(this.state.isVisible, () => (
      <Modal className='ModalDialog' show={ this.state.isVisible() } onHide={ this.bindEventToCommand(x => x.hide) } autoFocus
        keyboard={ this.props.noClose === false } enforceFocus={ this.props.noClose === true }
        backdrop={ this.props.noClose === true ? 'static' : true }
      >
        <Modal.Header closeButton={ this.props.noClose === false }>
          <Modal.Title>{ (this.props.title instanceof Function) ? this.props.title.apply(null) : this.props.title }</Modal.Title>
        </Modal.Header>
        {
          this.renderConditional(this.props.body != null, () => (
            <Modal.Body>{ (this.props.body instanceof Function) ? this.props.body.apply(null) : this.props.body }</Modal.Body>
          ))
        }
        {
          this.renderConditional(this.props.children != null, () => (
            <Modal.Footer>{ this.props.children }</Modal.Footer>
          ))
        }
      </Modal>
    ));
  }
}
