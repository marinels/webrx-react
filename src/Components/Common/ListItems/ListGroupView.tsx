import * as React from 'react';

import { ItemsView } from '../Items/ItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ListGroupPanel } from '../Panel/ListGroupPanel';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListGroupViewProps extends ListItemsViewTemplateProps {
  fill?: boolean;
}

export class ListGroupView extends ListItemsViewTemplate<ListGroupViewProps> {
  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsRenderProps } = x;
      return { fill, listItems, itemsRenderProps };
    });

    return (
      <ItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemsPanelTemplate={ this.renderListItemPanel.bind(this) }
        { ...this.getItemsRenderProps() }
        { ...rest }
      />
    );
  }

  protected renderListItemPanel(itemTemplates: Array<React.ReactNode>, itemsPresenter: ItemsPresenter, items: Array<{}> | undefined) {
    return (
      <ListGroupPanel fill={ this.props.fill } itemWrapper={
        (itemTemplate, item, index) => {
          return this.renderListItem(
            itemTemplate,
            item!,
            (isSelected, elem) => ({ active: isSelected }),
          );
        }
      }>
        { itemTemplates }
      </ListGroupPanel>
    );
  }
}
