import * as React from 'react';
import { Iterable } from 'ix';

import { wxr } from '../../React';
import { ItemsProps, ItemsView } from './ItemsView';
import { TreeItemSourceProps, TreeItemRenderProps, TreeItem } from './TreeItem';
import { ItemsPresenter } from './ItemsPresenter';

export interface TreeProps extends ItemsProps, TreeItemSourceProps, TreeItemRenderProps {
}

export class TreeView extends React.Component<TreeProps> {
  public static displayName = 'TreeView';

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle } = x;
      return { itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle };
    });

    return (
      <ItemsView
        { ...rest }
        className={ wxr.classNames('Tree', className) }
        viewModel={ this.props.viewModel }
        viewTemplate={ this.props.viewTemplate }
        itemsPanelTemplate={ this.props.itemsPanelTemplate }
        itemTemplate={ (item: {}, index: number) => {
          return this.renderItem(item, index);
        }}
        itemClassName={ this.props.itemClassName }
        itemStyle={ this.props.itemStyle }
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
      />
    );

    return React.cloneElement(treeItem, { key: treeItem.key || index }) ;
  }
}
