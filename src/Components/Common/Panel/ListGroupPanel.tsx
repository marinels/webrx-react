import * as React from 'react';
import { ListGroup, ListGroupProps, ListGroupItem } from 'react-bootstrap';

import { wxr } from '../../React';
import { PanelItemProps, Panel } from './Panel';

export interface ListGroupPanelProps extends ListGroupProps, PanelItemProps {
}

export class ListGroupPanel extends Panel<ListGroupPanelProps> {
  public static displayName = 'ListGroupPanel';

  render() {
    return this.renderPanel('ListGroupPanel', this.props, ListGroup);
  }

  renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    return super.renderItems(children, componentClass || ListGroupItem);
  }
}
