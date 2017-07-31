import * as React from 'react';
import { Observable } from 'rxjs';
import { Modal, ModalProps } from 'react-bootstrap';
import { BaseView, ViewModelProps } from '../../React';

import { ModalDialogViewModel } from './ModalDialogViewModel';

export interface ModalDialogProps extends ViewModelProps, Partial<ModalProps> {
  title: any;
  body?: any;
  canClose?: boolean;
}

export class ModalDialogView extends BaseView<ModalDialogProps, ModalDialogViewModel<{}>> {
  public static displayName = 'ModalDialogView';

  static defaultProps = {
    canClose: false,
  };

  updateOn() {
    return [
      this.state.isVisible.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { title, body, canClose }  = x;
      return { title, body, canClose };
    });

    return this.renderConditional(this.state.isVisible, () => (
      <Modal className={ this.classNames('ModalDialog', className) } autoFocus
        keyboard={ props.canClose === true } enforceFocus={ props.canClose === false }
        backdrop={ props.canClose === false ? 'static' : true }
        { ...rest }
        show={ this.state.isVisible.value } onHide={ this.bindEventToCommand(x => x.hide) }
      >
        { this.renderHeader() }
        { this.renderBody() }
        { this.renderFooter() }
      </Modal>
    ));
  }

  private renderHeader() {
    return (
      <Modal.Header closeButton={ this.props.canClose === true }>
        <Modal.Title>
          {
            this.renderConditional(
              (this.props.title instanceof Function) === true,
              () => this.props.title(),
              () => this.props.title,
            )
          }
        </Modal.Title>
      </Modal.Header>
    );
  }

  private renderBody() {
    return this.renderConditional(this.props.body != null, () => (
      <Modal.Body>
        {
          this.renderConditional(
            (this.props.body instanceof Function) === true,
            () => this.props.body(),
            () => this.props.body,
          )
        }
      </Modal.Body>
    ));
  }

  private renderFooter() {
    return this.renderConditional(this.props.children != null, () => (
      <Modal.Footer>
        { this.props.children }
      </Modal.Footer>
    ));
  }
}
