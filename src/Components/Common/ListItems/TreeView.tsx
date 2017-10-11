import * as React from 'react';
import * as classNames from 'classnames';

import { TreeItemsView } from '../Items/TreeItemsView';
import { ItemsPresenter } from '../Items/ItemsPresenter';
import { TreeItem, TreeItemSourceProps, TreeItemRenderProps } from '../Items/TreeItem';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { StackPanel } from '../Panel/StackPanel';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
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
        headerTemplate={ this.renderHeader.bind(this) }
        { ...this.getItemsRenderProps() }
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected renderHeader(item: {}, index: number, indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment, view: TreeItem) {
    const fragment = TreeItem.defaultHeaderTemplate(item, index, indent, expander, headerContent, view);

    return this.renderListItem(
      fragment,
      item,
      (isSelected, elem) => {
        return {
          className: classNames({ 'Selected': isSelected }, elem.props.className),
        };
      },
    );
  }
}
