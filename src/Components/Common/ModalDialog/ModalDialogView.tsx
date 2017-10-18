import * as React from 'react';
import { Observable } from 'rxjs';
import { Modal, ModalProps } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { ModalDialogViewModel } from './ModalDialogViewModel';

export interface ModalDialogProps extends Partial<ModalProps> {
  modalTitle?: {};
  modalBody?: {};
  modalFooter?: {};
  canClose?: boolean;
}

export interface ModalDialogViewProps extends BaseViewProps<ModalDialogViewModel<{}>, Modal>, ModalDialogProps {
}

export class ModalDialogView extends BaseView<ModalDialogViewProps, ModalDialogViewModel<{}>> {
  public static displayName = 'ModalDialogView';

  static defaultProps = {
    canClose: false,
    modalFooter: (view: ModalDialogView) => view.props.children,
  };

  updateOn(viewModel: Readonly<ModalDialogViewModel<{}>>) {
    return [
      viewModel.isVisible.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { modalTitle, modalBody, modalFooter, canClose }  = x;
      return { modalTitle, modalBody, modalFooter, canClose };
    });

    return this.renderConditional(this.viewModel.isVisible, () => (
      <Modal className={ this.classNames('ModalDialog', className) } autoFocus
        keyboard={ props.canClose === true } enforceFocus={ props.canClose === false }
        backdrop={ props.canClose === false ? 'static' : true }
        show={ this.viewModel.isVisible.value } onHide={ this.bindEventToCommand(x => x.hide) }
        { ...React.Component.trimProps(rest) }
      >
        { this.renderHeader() }
        { this.renderBody() }
        { this.renderFooter() }
      </Modal>
    ));
  }

  private renderHeader() {
    const titleContent = this.renderNullable(
      this.props.modalTitle,
      title => (
        <Modal.Title>
          { title instanceof Function ? title(this) : title }
        </Modal.Title>
      ),
    );

    return this.renderConditional(
      titleContent != null || this.props.canClose === true,
      () => (
        <Modal.Header closeButton={ this.props.canClose === true }>
          { titleContent }
        </Modal.Header>
      ),
    );
  }

  private renderBody() {
    return this.renderNullable(
      this.props.modalBody,
      body => (
        <Modal.Body>
          { body instanceof Function ? body(this) : body }
        </Modal.Body>
      ),
    );
  }

  private renderFooter() {
    return this.renderNullable(
      this.props.modalFooter,
      footer => {
        return this.renderNullable(
          footer instanceof Function ? footer(this) : footer,
          footerContent => (
            <Modal.Footer>
              { footerContent }
            </Modal.Footer>
          ),
        );
      },
    );
  }
}
