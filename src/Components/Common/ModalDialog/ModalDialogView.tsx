import * as React from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { Command } from '../../../WebRx';
import { BaseView, BaseViewProps } from '../../React';
import { ModalDialogViewModel } from './ModalDialogViewModel';

export type BootstrapModalProps = Omit2<ModalProps, React.HTMLProps<Modal>, { onHide: () => void; }>;

export interface ModalDialogProps extends BootstrapModalProps {
  modalTitle?: {};
  modalBody?: {};
  modalFooter?: {};
  canClose?: boolean;
  acceptCommand?: Command | ((ctx: {}) => Command | undefined);
  acceptCommandParameter?: any;
}

export interface ModalDialogViewProps extends BaseViewProps<ModalDialogViewModel<{}>>, ModalDialogProps {
}

export class ModalDialogView extends BaseView<ModalDialogViewProps, ModalDialogViewModel<{}>> {
  public static displayName = 'ModalDialogView';

  static defaultProps: Partial<ModalDialogProps> = {
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
      const { modalTitle, modalBody, modalFooter, canClose, acceptCommand, acceptCommandParameter }  = x;
      return { modalTitle, modalBody, modalFooter, canClose, acceptCommand, acceptCommandParameter };
    });

    return this.wxr.renderConditional(this.viewModel.isVisible, () => (
      <Modal className={ this.wxr.classNames('ModalDialog', className) } autoFocus
        keyboard={ props.canClose === true } enforceFocus={ props.canClose === false }
        backdrop={ props.canClose === false ? 'static' : true }
        show={ this.viewModel.isVisible.value } onHide={ this.bindEventToCommand(x => x.hide) }
        { ...this.trimProps(rest) }
      >
        { this.renderHeader() }
        { this.renderBody() }
        { this.renderFooter() }
      </Modal>
    ));
  }

  private renderHeader() {
    const titleContent = this.wxr.renderNullable(
      this.props.modalTitle,
      title => (
        <Modal.Title>
          { title instanceof Function ? title(this) : title }
        </Modal.Title>
      ),
    );

    return this.wxr.renderConditional(
      titleContent != null || this.props.canClose === true,
      () => (
        <Modal.Header closeButton={ this.props.canClose === true }>
          { titleContent }
        </Modal.Header>
      ),
    );
  }

  private renderBody() {
    return this.wxr.renderNullable(
      this.props.modalBody,
      body => (
        <Modal.Body onKeyDown={ this.handleKeyDown.bind(this) }>
          { body instanceof Function ? body(this) : body }
        </Modal.Body>
      ),
    );
  }

  private renderFooter() {
    return this.wxr.renderNullable(
      this.props.modalFooter,
      footer => {
        return this.wxr.renderNullable(
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

  private handleKeyDown(e: React.KeyboardEvent<any>) {
    if (this.props.acceptCommand && e.keyCode === 13) {
      const ctx = this.viewModel.context.value;
      const cmd = this.props.acceptCommand instanceof Function ?
        this.props.acceptCommand(ctx) :
        this.props.acceptCommand;
      const param = this.props.acceptCommandParameter instanceof Function ?
        this.props.acceptCommandParameter(ctx) :
        this.props.acceptCommandParameter;

      if (cmd && cmd.canExecuteFor(param)) {
        return cmd.execute(param);
      }
    }

    return undefined;
  }
}
