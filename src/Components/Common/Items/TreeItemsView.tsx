import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { ItemsProps, ItemsView } from './ItemsView';
import { TreeItemSourceProps, TreeItemRenderProps, TreeItem } from './TreeItem';
import { ItemsPresenter } from './ItemsPresenter';

export interface TreeProps extends ItemsProps, TreeItemSourceProps, TreeItemRenderProps {
}

export class TreeItemsView extends React.Component<TreeProps> {
  public static displayName = 'TreeItemsView';

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper } = x;
      return { itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, itemWrapper };
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
        { ...React.Component.trimProps(rest) }
      />
    );
  }

  protected renderItem(item: {}, index: number) {
    const treeItem = (
      <TreeItem
        item={ item }
        index={ index }
        itemsSource={ this.props.itemsSource }
        itemsTemplate={ this.props.itemsTemplate }
        startExpanded={ this.props.startExpanded }
        expandedIconName={ this.props.expandedIconName }
        collapsedIconName={ this.props.collapsedIconName }
        expanderIconTemplate={ this.props.expanderIconTemplate }
        itemsPanelTemplate={ this.props.itemsPanelTemplate }
        itemTemplate={ this.props.itemTemplate }
        itemClassName={ this.props.itemClassName }
        itemStyle={ this.props.itemStyle }
        itemProps={ this.props.itemProps }
        itemWrapper={ this.props.itemWrapper }
      />
    );

    return React.cloneElement(treeItem, { key: treeItem.key || index }) ;
  }
}
