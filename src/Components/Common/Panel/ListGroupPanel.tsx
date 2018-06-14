import * as React from 'react';
import { ListGroup, ListGroupProps } from 'react-bootstrap';

import { PanelItemProps, PanelItemContext, PanelTemplateProps, Panel } from './Panel';

export interface ListGroupPanelProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends PanelItemProps<T, TContext>, PanelTemplateProps {
  componentClass?: React.ReactType;
  fill?: boolean;
}

export interface ListGroupPanelComponentProps extends ListGroupProps, ListGroupPanelProps {
}

export class ListGroupPanel extends Panel<ListGroupPanelComponentProps> {
  public static displayName = 'ListGroupPanel';

  static defaultProps: Partial<ListGroupPanelComponentProps> = {
    itemClassName: 'list-group-item',
  };

  render() {
    return this.renderPanel('ListGroupPanel', this.props, ListGroup);
  }

  renderItems(children?: React.ReactNode, componentClass?: React.ReactType) {
    return super.renderItems(children, componentClass || 'div');
  }
}
