import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { ItemsProps, ItemsViewProps, ItemsView } from './ItemsView';
import { TreeItemFacadeProps, TreeItem } from './TreeItem';
import { ItemsPresenter } from './ItemsPresenter';

export interface TreeItemsProps extends ItemsProps, TreeItemFacadeProps {
}

export interface TreeItemsViewProps extends ItemsViewProps, TreeItemsProps {
}

export class TreeItemsView extends React.Component<TreeItemsViewProps> {
  public static displayName = 'TreeItemsView';

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact } = x;
      return { itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact };
    });

    return (
      <ItemsView
        className={ wxr.classNames('TreeItems', className) }
        viewModel={ this.props.viewModel }
        viewTemplate={ props.viewTemplate }
        itemsPanelTemplate={ props.itemsPanelTemplate }
        itemTemplate={ (item: {}, index: number) => {
          return this.renderItem(item, index);
        }}
        itemClassName={ props.itemClassName }
        itemStyle={ props.itemStyle }
        itemProps={ props.itemProps }
        compact={ props.compact }
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected renderItem(item: {}, index: number) {
    return TreeItem.renderTreeItem(item, index, this.props);
  }
}
