import * as React from 'react';
import { Observable } from 'rxjs';
import { Modal, ModalProps } from 'react-bootstrap';
import { BaseView, ViewModelProps } from '../../React';

import { ModalDialogViewModel } from './ModalDialogViewModel';

export interface ModalDialogProps extends ViewModelProps, Partial<ModalProps> {
  title?: any;
  body?: any;
  footer?: any;
  canClose?: boolean;
}

export class ModalDialogView extends BaseView<ModalDialogProps, ModalDialogViewModel<{}>> {
  public static displayName = 'ModalDialogView';

  static defaultProps = {
    canClose: false,
    footer: (view: ModalDialogView) => view.props.children,
  };

  updateOn() {
    return [
      this.state.isVisible.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { title, body, footer, canClose }  = x;
      return { title, body, footer, canClose };
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
    const titleContent = this.renderNullable(
      this.props.title,
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
      this.props.body,
      body => (
        <Modal.Body>
          { body instanceof Function ? body(this) : body }
        </Modal.Body>
      ),
    );
  }

  private renderFooter() {
    return this.renderNullable(
      this.props.footer,
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
