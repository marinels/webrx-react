import * as React from 'react';
import * as classNames from 'classnames';

import { PanelView } from './PanelView';
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

export interface TreeViewComponentProps extends React.HTMLProps<any>, TreeViewProps {
}

export class TreeView extends ListItemsViewTemplate<TreeViewComponentProps> {
  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    const treeItemProps: any = React.Component.trimProps(rest);

    return (
      <TreeItemsView
        className={ className }
        viewModel={ this.getListItems() }
        headerTemplate={ this.renderHeader.bind(this) }
        { ...this.getItemsProps() }
        { ...treeItemProps }
      />
    );
  }

  protected renderHeader(item: {}, index: number, indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment, view: TreeItem) {
    const fragment = TreeItem.defaultHeaderTemplate(item, index, indent, expander, headerContent, view);

    return this.renderListItem(
      fragment,
      item,
      PanelView.getSelectedProps,
    );
  }
}
