import * as React from 'react';
import * as classNames from 'classnames';

import { TreeItemsView } from '../Items/TreeItemsView';
import { TreeItemSourceProps, TreeItemRenderProps } from '../Items/TreeItem';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { ListItemsViewModel } from './ListItemsViewModel';

export interface TreeViewProps extends ListItemsViewTemplateProps, TreeItemSourceProps, TreeItemRenderProps {
  fill?: boolean;
}

export class TreeView extends ListItemsViewTemplate<TreeViewProps> {
  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsRenderProps } = x;
      return { fill, listItems, itemsRenderProps };
    });

    return (
      <TreeItemsView
        className={ className }
        viewModel={ this.getListItems() }
        itemWrapper={
          (itemTemplate, item, index) => {
            return this.renderListItem(
              itemTemplate,
              item!,
              (isSelected, elem) => {
                return {
                  className: classNames({ 'Selected': isSelected }, elem.props.className),
                };
              },
            );
          }
        }
        { ...this.getItemsRenderProps() }
        { ...rest }
      />
    );
  }
}
