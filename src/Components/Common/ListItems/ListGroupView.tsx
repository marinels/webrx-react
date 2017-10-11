import * as React from 'react';

import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ListGroupPanel } from '../Panel/ListGroupPanel';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListGroupViewProps extends ListItemsViewTemplateProps {
  fill?: boolean;
}

export class ListGroupView extends ListItemsViewTemplate<ListGroupViewProps> {
  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    return (
      <ItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemsPanelTemplate={ this.renderListItemPanel.bind(this) }
        { ...this.getItemsProps() }
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected renderListItemPanel(itemTemplates: Array<React.ReactNode>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    return (
      <ListGroupPanel fill={ this.props.fill } itemTemplate={ (f, c) => this.renderPanelItem(f, c, items) }>
        { itemTemplates }
      </ListGroupPanel>
    );
  }

  protected renderPanelItem(fragment: PanelFragment, context: PanelItemContext, items: Array<{}> | undefined) {
    if (items == null) {
      return fragment;
    }

    const item = items[context.index];

    return this.renderListItem(
      fragment,
      item,
      (isSelected, elem) => ({ active: isSelected }),
    );
  }
}
