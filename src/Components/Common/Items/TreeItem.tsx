import { Iterable } from 'ix';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { IterableLike } from '../../../WebRx';
import { wxr } from '../../React';
import { ItemsPresenterProps, ItemsPresenterTemplateProps, ItemsPresenter } from './ItemsPresenter';
import { PanelItemProps } from '../Panel/Panel';

export type RecursiveItemsSource<T> = (item: T) => (IterableLike<T> | undefined);

export interface TreeItemSourceProps {
  /**
   * function to produce the recursive items source for the provided item
   */
  itemsSource: RecursiveItemsSource<{}>;

  /**
   * template to render each item belonging to the bound item
   * use this template to define your own items presenter template
   */
  itemsTemplate?: (items: IterableLike<{}> | undefined) => React.ReactNode;
}

export interface TreeItemRenderProps {
  /**
   * tree node depth (defaults to 0)
   * this should not be assigned unless defining your own itemsTemplate
   */
  depth?: number;

  /**
   * set the isExpanded intial state
   */
  startExpanded?: boolean;

  /**
   * override the default expanded icon name
   * default is a '-' in a rounded square
   */
  expandedIconName?: string;

  /**
   * override the default collapsed icon name
   * default is a '+' in a rounded square
   */
  collapsedIconName?: string;

  /**
   * Override the expander icon template
   * default behaviour is to render an icon using the expandedIconName and collapsedIconName
   */
  expanderIconTemplate?: (isExpanded: boolean, expandedIconName?: string, collapsedIconName?: string) => React.ReactNode;
}

export interface TreeItemProps extends React.HTMLAttributes<TreeItemProps>, TreeItemSourceProps, TreeItemRenderProps, ItemsPresenterTemplateProps, PanelItemProps {
  /**
   * the item that this tree node represents
   */
  item: {};

  /**
   * the index this item is found within its parent container.
   * this is necessary for key construction if no key is specified
   */
  index: number;
}

export interface TreeItemState {
  /**
   * true if the tree item is expanded
   */
  isExpanded: boolean;
}

export class TreeItem extends React.Component<TreeItemProps, TreeItemState> {
  static defaultProps = {
    depth: 0,
  };

  public static defaultExpandedIconName = 'minus-square-o';
  public static defaultCollapsedIconName = 'plus-square-o';

  public static defaultItemsTemplate(items: IterableLike<{}> | undefined, view: TreeItem) {
    return (view.state.isExpanded === false || items == null) ? false : (
      <ItemsPresenter
        itemsSource={ items }
        viewTemplate={ view.props.viewTemplate }
        itemsPanelTemplate={ view.props.itemsPanelTemplate }
        itemTemplate={ (item: {}, index: number) => {
          const treeItem = (
            <TreeItem
              item={ item }
              index={ index }
              itemsSource={ view.props.itemsSource }
              depth={ (view.props.depth || 0) + 1 }
              startExpanded={ view.props.startExpanded }
              expandedIconName={ view.props.expandedIconName }
              collapsedIconName={ view.props.collapsedIconName }
              expanderIconTemplate={ view.props.expanderIconTemplate }
              viewTemplate={ view.props.viewTemplate }
              itemsPanelTemplate={ view.props.itemsPanelTemplate }
              itemTemplate={ view.props.itemTemplate }
              itemClassName={ view.props.itemClassName }
              itemStyle={ view.props.itemStyle }
              itemProps={ view.props.itemProps }
            />
          );

          return React.cloneElement(treeItem, { key: treeItem.key || index });
        }}
        itemClassName={ view.props.itemClassName }
        itemStyle={ view.props.itemStyle }
        itemProps={ view.props.itemProps }
      />
    );
  }

  public static defaultExpanderIconTemplate(
    isExpanded: boolean,
    expandedIconName = TreeItem.defaultExpandedIconName,
    collapsedIconName = TreeItem.defaultCollapsedIconName,
  ) {
    const iconName = isExpanded === true ? expandedIconName : collapsedIconName;

    return (
      <Icon name={ iconName } size='lg' fixedWidth />
    );
  }

  constructor(props?: TreeItemProps, context?: any) {
    super(props, context);

    this.state = {
      isExpanded: this.props.startExpanded || false,
    };
  }

  render() {
    const { className, props, rest, children } = this.restProps(x => {
      const { item, index, itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps } = x;
      return { item, index, itemsSource, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, expanderIconTemplate, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps };
    });

    const header = this.renderHeader();
    const key = this.getKey(header);
    const items = this.props.itemsSource(this.props.item);
    const treeItems = this.renderItems(items);

    return (
      <div key={ key } { ...rest } className={ wxr.classNames('TreeItem', className) }>
        <div className='TreeItem-Header'>
          { this.renderIndent() }
          <div className='TreeItem-Expander'>
            { this.renderExpander(items) }
          </div>
          <div className='TreeItem-HeaderContent'>{ header }</div>
        </div>
        {
          treeItems && (
            <div className='TreeItem-Expansion'>
              <div className='TreeItem-Items'>
                { treeItems }
              </div>
            </div>
          )
        }
      </div>
    );
  }

  protected toggleExpansion() {
    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  protected getKey(header: any) {
    return (header != null ? header.key : undefined) || this.props.index;
  }

  protected renderIndent() {
    return Iterable
      .range(0, this.props.depth || 0)
      .map((x, i) => {
        return (
          <div key={ i } className='TreeItem-Indent'></div>
        ) as React.ReactNode;
      })
      .defaultIfEmpty(false)
      .toArray();
  }

  protected renderExpanderIcon() {
    const template = (this.props.expanderIconTemplate || TreeItem.defaultExpanderIconTemplate);

    return template(this.state.isExpanded, this.props.expandedIconName, this.props.collapsedIconName);
  }

  protected renderExpander(items: IterableLike<{}> | undefined) {
    const isEmpty = items == null || Iterable
      .from(items)
      .isEmpty();

    return isEmpty ? false : (
      <Button bsStyle='link' onClick={ () => this.toggleExpansion() }>
        { this.renderExpanderIcon() }
      </Button>
    );
  }

  protected renderHeader() {
    const itemTemplate = this.props.itemTemplate || ItemsPresenter.defaultItemTemplate;

    return itemTemplate(this.props.item, this.props.index);
  }

  protected renderItems(items: IterableLike<{}> | undefined): React.ReactNode {
    return this.props.itemsTemplate == null ?
      TreeItem.defaultItemsTemplate(items, this) :
      this.props.itemsTemplate(items);
  }
}
