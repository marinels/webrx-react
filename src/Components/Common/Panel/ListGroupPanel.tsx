import * as React from 'react';
import { ListGroup, ListGroupProps, ListGroupItem } from 'react-bootstrap';

import { PanelItemProps, PanelTemplateProps, Panel } from './Panel';

export interface ListGroupPanelProps extends PanelItemProps, PanelTemplateProps {
  componentClass?: React.ReactType;
  fill?: boolean;
}

export interface ListGroupPanelComponentProps extends ListGroupProps, ListGroupPanelProps {
}

export class ListGroupPanel extends Panel<ListGroupPanelComponentProps> {
  public static displayName = 'ListGroupPanel';

  render() {
    return this.renderPanel('ListGroupPanel', this.props, ListGroup);
  }

  renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    return super.renderItems(children, componentClass || ListGroupItem);
  }
}
