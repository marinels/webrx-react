import * as React from 'react';

import { ItemsProps } from '../Items/ItemsView';
import { PanelItemContext } from '../Panel/Panel';
import { ListItemsViewModel } from './ListItemsViewModel';
import {
  SelectableListItem,
  SelectedPropsFunction,
} from './SelectableListItem';

export interface ListItemsViewTemplateProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext
> {
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  listItems?: Readonly<ListItemsViewModel<T>>;
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  itemsProps?: ItemsProps<T, TContext>;
  /**
   * internal passthru property
   * DO NOT SET, this property is assigned automatically by the ListItemsView
   */
  className?: string;
}

export abstract class ListItemsViewTemplate<
  T extends ListItemsViewTemplateProps
> extends React.Component<T> {
  protected getListItems() {
    return this.props.listItems as Readonly<ListItemsViewModel<{}>>;
  }

  protected getItemsProps() {
    return this.props.itemsProps as ItemsProps;
  }

  protected renderListItem(
    itemTemplate: React.ReactNode,
    item: {},
    selectedProps?: SelectedPropsFunction,
  ) {
    return (
      <SelectableListItem
        listItems={this.getListItems()}
        item={item}
        selectedProps={selectedProps}
      >
        {itemTemplate}
      </SelectableListItem>
    );
  }
}
