import * as React from 'react';

import { ItemsProps } from '../Items/ItemsView';
import { SelectableListItem, SelectedPropsFunction } from './SelectableListItem';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface ListItemsViewTemplateProps {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  listItems?: Readonly<ListItemsViewModel<{}>>;
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  itemsProps?: ItemsProps;
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  className?: string;
}

export abstract class ListItemsViewTemplate<T extends ListItemsViewTemplateProps> extends React.Component<T> {
  protected getListItems() {
    return this.props.listItems as Readonly<ListItemsViewModel<{}>>;
  }

  protected getItemsProps() {
    return this.props.itemsProps as ItemsProps;
  }

  protected renderListItem(itemTemplate: React.ReactNode, item: {}, selectedProps?: SelectedPropsFunction) {
    return (
      <SelectableListItem listItems={ this.getListItems() } item={ item } selectedProps={ selectedProps }>
        { itemTemplate }
      </SelectableListItem>
    );
  }
}
