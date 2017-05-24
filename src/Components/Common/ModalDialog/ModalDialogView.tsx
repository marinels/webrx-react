import * as React from 'react';
import { Observable } from 'rx';
import { Modal } from 'react-bootstrap';
import { BaseView, BaseViewProps } from '../../React';

import { ModalDialogViewModel } from './ModalDialogViewModel';

export interface ModalDialogProps extends BaseViewProps {
  title: any;
  body?: any;
  canClose?: boolean;
}

function applyClassName(modalElem: HTMLElement, className: string) {
  let elem = modalElem.parentElement;
  while (elem != null && elem.getAttribute('role') !== 'dialog' && elem.tagName.toLowerCase() !== 'body') {
    elem = elem.parentElement;
  }

  if (elem != null) {
    elem.className = className;
  }
}

// this will patch how modals function to inject the style namespace at a resaonable
// location to ensure proper handling of modals (which exist outside of the app container)
Modal.defaultProps = Object.assign(
  {},
  {
    onEnter: (x: HTMLElement) => applyClassName(x, 'webrx-react bootstrap-3'),
    onExited: (x: HTMLElement) => applyClassName(x, ''),
  },
  Modal.defaultProps,
);

export class ModalDialogView extends BaseView<ModalDialogProps, ModalDialogViewModel> {
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
      <Modal { ...rest } className={ this.classNames('ModalDialog', className) } autoFocus
        show={ this.state.isVisible.value } onHide={ this.bindEventToCommand(x => x.hide) }
        keyboard={ props.canClose === true } enforceFocus={ props.canClose === false }
        backdrop={ props.canClose === false ? 'static' : true }
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
              () => this.props.title.apply(null),
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
            () => this.props.body.apply(null),
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
