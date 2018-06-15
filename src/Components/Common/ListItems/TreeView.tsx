import * as React from 'react';

import { TreeItem, TreeItemRenderProps, TreeItemSourceProps } from '../Items/TreeItem';
import { TreeItemsView } from '../Items/TreeItemsView';
import { PanelFragment, PanelItemContext } from '../Panel/Panel';
import { ListItemsViewTemplate, ListItemsViewTemplateProps } from './ListItemsViewTemplate';
import { PanelView } from './PanelView';

export interface TreeViewProps<
  T = {},
  TContext extends PanelItemContext = PanelItemContext,
> extends ListItemsViewTemplateProps<T, TContext>, TreeItemSourceProps<T>, TreeItemRenderProps {
  fill?: boolean;
}

export interface TreeViewComponentProps extends React.HTMLProps<any>, TreeViewProps {
}

export class TreeView extends ListItemsViewTemplate<TreeViewComponentProps> {
  constructor(props: any) {
    super(props);

    this.renderHeader = this.renderHeader.bind(this);
  }

  render() {
    const { className, rest } = this.restProps(x => {
      const { fill, listItems, itemsProps } = x;
      return { fill, listItems, itemsProps };
    });

    const treeItemProps: any = this.trimProps(rest);

    return (
      <TreeItemsView
        className={ className }
        viewModel={ this.getListItems() }
        headerTemplate={ this.renderHeader }
        { ...this.getItemsProps() }
        { ...treeItemProps }
      />
    );
  }

  protected renderHeader(
    item: {},
    index: number,
    indent: PanelFragment[],
    expander: PanelFragment,
    headerContent: PanelFragment,
    view: TreeItem,
  ) {
    const fragment = TreeItem.defaultHeaderTemplate(item, index, indent, expander, headerContent, view);

    return this.renderListItem(
      fragment,
      item,
      PanelView.getSelectedProps,
    );
  }
}
