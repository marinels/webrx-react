import { Iterable } from 'ix';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { IterableLike } from '../../../WebRx';
import { ItemsPresenterProps, ItemsPresenterTemplateProps, ItemsPresenter } from './ItemsPresenter';
import { PanelItemProps, PanelRenderProps, Panel, PanelFragment } from '../Panel/Panel';

export type RecursiveItemsSource<T> = (item: T) => (IterableLike<T> | undefined);

export interface TreeItemSourceProps {
  /**
   * function to produce the recursive items source for the provided item
   */
  itemsSource: RecursiveItemsSource<{}>;
}

export interface TreeItemTemplateProps {
  /**
   * Override the expander icon template
   * default behaviour is to render an icon using the expandedIconName and collapsedIconName
   */
  expanderIconTemplate?: (isExpanded: boolean, expandedIconName?: string, collapsedIconName?: string) => PanelFragment;

  /**
   * Override the header template
   * compose a custom header out of the subcomponents
   */
  headerTemplate?: (item: {}, index: number, indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment, view: TreeItem) => PanelFragment;

  /**
   * template to render each item belonging to the bound item
   * use this template to define your own items presenter template
   */
  itemsTemplate?: (items: IterableLike<{}> | undefined, view: TreeItem) => PanelFragment;
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
}

export interface TreeItemFacadeProps extends TreeItemSourceProps, TreeItemTemplateProps, TreeItemRenderProps, ItemsPresenterTemplateProps, PanelItemProps, PanelRenderProps {
}

export interface TreeItemProps extends TreeItemFacadeProps {
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

export interface TreeItemComponentProps extends React.HTMLProps<any>, TreeItemProps {
}

export interface TreeItemState {
  /**
   * true if the tree item is expanded
   */
  isExpanded: boolean;
}

export class TreeItem extends React.Component<TreeItemComponentProps, TreeItemState> {
  static defaultProps = {
    depth: 0,
  };

  public static defaultExpandedIconName = 'minus-square-o';
  public static defaultCollapsedIconName = 'plus-square-o';

  public static generateKey(fragment: PanelFragment, index: number) {
    if (React.isValidElement(fragment) && fragment.key != null) {
      return fragment.key;
    }

    return index;
  }

  public static renderTreeItem(item: {}, index: number, props: TreeItemFacadeProps) {
    return (
      <TreeItem
        key={ index }
        item={ item }
        index={ index }
        itemsSource={ props.itemsSource }
        expanderIconTemplate={ props.expanderIconTemplate }
        headerTemplate={ props.headerTemplate }
        itemsTemplate={ props.itemsTemplate }
        depth={ props.depth == null ? 0 : (props.depth + 1) }
        startExpanded={ props.startExpanded }
        expandedIconName={ props.expandedIconName }
        collapsedIconName={ props.collapsedIconName }
        viewTemplate={ props.viewTemplate }
        itemsPanelTemplate={ props.itemsPanelTemplate }
        itemTemplate={ props.itemTemplate }
        itemClassName={ props.itemClassName }
        itemStyle={ props.itemStyle }
        itemProps={ props.itemProps }
        compact={ props.compact }
        emptyContent={ props.emptyContent }
      />
    );
  }

  public static defaultHeaderTemplate(item: {}, index: number, indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment, view: TreeItem) {
    return (
      <div className='TreeItem-Header'>
        { indent }
        <div className='TreeItem-Expander'>
          { expander }
        </div>
        <div className='TreeItem-HeaderContent'>{ headerContent }</div>
      </div>
    );
  }

  public static defaultItemsTemplate(items: IterableLike<{}> | undefined, view: TreeItem) {
    return (view.state.isExpanded === false || items == null) ? false : (
      <ItemsPresenter
        itemsSource={ items }
        viewTemplate={ view.props.viewTemplate }
        itemsPanelTemplate={ view.props.itemsPanelTemplate }
        itemTemplate={ (item: {}, index: number) => {
          return TreeItem.renderTreeItem(item, index, view.props);
        }}
        itemClassName={ view.props.itemClassName }
        itemStyle={ view.props.itemStyle }
        itemProps={ view.props.itemProps }
        compact={ view.props.compact }
        emptyContent={ view.props.emptyContent }
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
      const { item, index, itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent } = x;
      return { item, index, itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, expandedIconName, collapsedIconName, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent };
    });

    const headerContent = this.renderHeaderContent();
    const key = TreeItem.generateKey(headerContent, this.props.index);
    const items = this.props.itemsSource(this.props.item);
    const indent = this.renderIndent();
    const expander = this.renderExpander(items);
    const header = this.renderHeader(indent, expander, headerContent);
    const treeItems = this.renderItems(items);

    return (
      <div key={ key } { ...rest } className={ this.wxr.classNames('TreeItem', className) }>
        { header }
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

  protected toggleExpansion(e: MouseEvent) {
    e.stopPropagation();

    this.setState({
      isExpanded: !this.state.isExpanded,
    });
  }

  protected renderIndent() {
    return Iterable
      .range(0, this.props.depth || 0)
      .map((x, i) => {
        return (
          <div key={ i } className='TreeItem-Indent'></div>
        ) as PanelFragment | false;
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
      <Button bsStyle='link' onClick={ this.toggleExpansion.bind(this) }>
        { this.renderExpanderIcon() }
      </Button>
    );
  }

  protected renderHeaderContent() {
    const itemTemplate = this.props.itemTemplate || ItemsPresenter.defaultItemTemplate;

    return itemTemplate(this.props.item, this.props.index);
  }

  protected renderHeader(indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment) {
    const template = this.props.headerTemplate || TreeItem.defaultHeaderTemplate;

    return template(this.props.item, this.props.index, indent, expander, headerContent, this);
  }

  protected renderItems(items: IterableLike<{}> | undefined): PanelFragment {
    const template = this.props.itemsTemplate || TreeItem.defaultItemsTemplate;

    return template(items, this);
  }
}
