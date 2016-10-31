import * as React from 'react';
import { Modal } from 'react-bootstrap';

import './Sidebar.less';

export interface SidebarProps {
  onHide: Function;
  isVisible?: boolean;
  side?: string;
  header?: any;
  children?: any;
}

export class Sidebar extends React.Component<SidebarProps, any> {
  public static displayName = 'Sidebar';

  static defaultProps = {
    side: 'left',
  };

  render() {
    return (
      <Modal className={`Sidebar ${this.props.side}`}
        onHide={this.props.onHide} show={this.props.isVisible}
        autoFocus keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>{this.props.header}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { this.props.children }
        </Modal.Body>
      </Modal>
    );
  }
}
