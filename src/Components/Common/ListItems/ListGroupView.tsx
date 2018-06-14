import * as React from 'react';

import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListGroupPanel } from '../Panel/ListGroupPanel';
import { PanelItemContext } from '../Panel/Panel';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelView } from './PanelView';

export interface ListGroupViewProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext,
> extends ListItemsViewTemplateProps<T, TContext> {
  fill?: boolean;
}

export interface ListGroupViewComponentProps extends React.HTMLProps<any>, ListGroupViewProps {
}

export class ListGroupView extends ListItemsViewTemplate<ListGroupViewComponentProps> {
  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    return (
      <PanelView
        className={ className }
        itemsPanelTemplate={ this.renderListItemPanel.bind(this) }
        listItems={ props.listItems }
        itemsProps={ props.itemsProps }
        { ...this.trimProps(rest) }
      >
        { children }
      </PanelView>
    );
  }

  protected renderListItemPanel(
    itemTemplates: React.ReactNode[],
    itemsPresenter: ItemsPresenter,
    items: Array<{}> | undefined,
  ) {
    return (
      <ListGroupPanel fill={ this.props.fill }>
        { itemTemplates }
      </ListGroupPanel>
    );
  }
}
