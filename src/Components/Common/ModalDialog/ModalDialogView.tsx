import * as React from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { Command } from '../../../WebRx';
import { BaseView, BaseViewProps } from '../../React';
import { ModalDialogViewModel } from './ModalDialogViewModel';

export type BootstrapModalProps = Omit2<
  ModalProps,
  React.HTMLProps<Modal>,
  { onHide: () => void }
>;

export interface ModalDialogProps extends BootstrapModalProps {
  modalTitle?: {};
  modalBody?: {};
  modalFooter?: {};
  canClose?: boolean;
  acceptCommand?: Command | ((ctx: {}) => Command | undefined);
  acceptCommandParameter?: any;
}

export interface ModalDialogViewProps
  extends BaseViewProps<ModalDialogViewModel<any>>,
    ModalDialogProps {}

export class ModalDialogView extends BaseView<
  ModalDialogViewProps,
  ModalDialogViewModel<any>
> {
  public static displayName = 'ModalDialogView';

  static defaultProps: Partial<ModalDialogProps> = {
    canClose: false,
    modalFooter: (view: ModalDialogView) => view.props.children,
  };

  constructor(props: any) {
    super(props);

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  updateOn(viewModel: Readonly<ModalDialogViewModel<any>>) {
    return [viewModel.isVisible.changed];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {
        modalTitle,
        modalBody,
        modalFooter,
        canClose,
        acceptCommand,
        acceptCommandParameter,
      } = x;
      return {
        modalTitle,
        modalBody,
        modalFooter,
        canClose,
        acceptCommand,
        acceptCommandParameter,
      };
    });

    return this.wxr.renderConditional(this.viewModel.isVisible, () => (
      <Modal
        className={this.wxr.classNames('ModalDialog', className)}
        autoFocus
        keyboard={props.canClose === true}
        enforceFocus={props.canClose === false}
        backdrop={props.canClose === false ? 'static' : true}
        show={this.viewModel.isVisible.value}
        onHide={this.bindEventToCommand(x => x.hide)}
        {...this.trimProps(rest)}
      >
        {this.renderHeader()}
        {this.renderBody()}
        {this.renderFooter()}
      </Modal>
    ));
  }

  private renderHeader() {
    const titleContent = this.props.modalTitle && (
      <Modal.Title>
        {this.props.modalTitle instanceof Function
          ? this.props.modalTitle(this)
          : this.props.modalTitle}
      </Modal.Title>
    );

    return (
      titleContent &&
      this.props.canClose && (
        <Modal.Header closeButton={this.props.canClose === true}>
          {titleContent}
        </Modal.Header>
      )
    );
  }

  private renderBody() {
    return (
      this.props.modalBody && (
        <Modal.Body onKeyDown={this.handleKeyDown}>
          {this.props.modalBody instanceof Function
            ? this.props.modalBody(this)
            : this.props.modalBody}
        </Modal.Body>
      )
    );
  }

  private renderFooter() {
    if (!this.props.modalFooter) {
      return false;
    }

    const footer =
      this.props.modalFooter instanceof Function
        ? this.props.modalFooter(this)
        : this.props.modalFooter;

    return footer && <Modal.Footer>{footer}</Modal.Footer>;
  }

  private handleKeyDown(e: React.KeyboardEvent<any>) {
    if (this.props.acceptCommand && e.keyCode === 13) {
      const ctx = this.viewModel.context.value;
      const cmd =
        this.props.acceptCommand instanceof Function
          ? this.props.acceptCommand(ctx)
          : this.props.acceptCommand;
      const param =
        this.props.acceptCommandParameter instanceof Function
          ? this.props.acceptCommandParameter(ctx)
          : this.props.acceptCommandParameter;

      if (cmd && cmd.canExecuteFor(param)) {
        return cmd.execute(param);
      }
    }

    return undefined;
  }
}
