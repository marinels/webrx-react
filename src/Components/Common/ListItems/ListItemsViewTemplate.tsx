import * as React from 'react';

import { ItemsFacadeProps } from '../Items/ItemsView';
import { SelectableListItem, SelectedPropsFunction } from './SelectableListItem';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListItemsViewTemplateProps extends React.HTMLProps<ListItemsViewTemplate<ListItemsViewTemplateProps>> {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  listItems?: Readonly<ListItemsViewModel<{}>>;
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  itemsRenderProps?: ItemsFacadeProps;
}

export abstract class ListItemsViewTemplate<T extends ListItemsViewTemplateProps> extends React.Component<T> {
  protected getListItems() {
    return this.props.listItems as Readonly<ListItemsViewModel<{}>>;
  }

  protected getItemsRenderProps() {
    return this.props.itemsRenderProps as ItemsFacadeProps;
  }

  protected renderListItem(itemTemplate: React.ReactNode, item: {}, selectedProps?: SelectedPropsFunction) {
    return (
      <SelectableListItem listItems={ this.getListItems() } item={ item } selectedProps={ selectedProps }>
        { itemTemplate }
      </SelectableListItem>
    );
  }
}
