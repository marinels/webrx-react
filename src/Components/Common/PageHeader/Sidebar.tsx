import * as React from 'react';
import { Modal } from 'react-bootstrap';

export interface SidebarProps {
  onHide: Function;
  isVisible?: boolean;
  side?: string;
  header?: any;
}

export interface SidebarComponentProps extends SidebarProps {
}

export class Sidebar extends React.Component<SidebarComponentProps> {
  public static displayName = 'Sidebar';

  static defaultProps: Partial<SidebarProps> = {
    side: 'left',
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { onHide, isVisible, side, header } = x;
      return { onHide, isVisible, side, header };
    });

    return (
      <Modal { ...rest } className={ this.wxr.classNames('Sidebar', props.side, className) }
        onHide={ this.props.onHide } show={ this.props.isVisible } autoFocus keyboard
      >
        <Modal.Header closeButton>
          <Modal.Title>{ props.header }</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { children }
        </Modal.Body>
      </Modal>
    );
  }
}
