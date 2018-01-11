import { Iterable } from 'ix';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { IterableLike } from '../../../WebRx';
import { ItemsPresenterProps, ItemsPresenterTemplateProps, ItemsPresenter } from './ItemsPresenter';
import { PanelItemProps, PanelItemContext, PanelRenderProps, Panel, PanelFragment } from '../Panel/Panel';

export type RecursiveItemsSource<T> = (item: T) => (IterableLike<T> | undefined);

export interface TreeItemSourceProps<T = {}> {
  /**
   * function to produce the recursive items source for the provided item
   */
  itemsSource: RecursiveItemsSource<T>;
}

export interface TreeItemTemplateProps<T = {}> {
  /**
   * Override the expander icon template
   * default behaviour is to render an icon using the expandedIconName and collapsedIconName
   */
  expanderIconTemplate?: (isExpanded: boolean, expandedIconName?: string, collapsedIconName?: string) => PanelFragment;

  /**
   * Override the header template
   * compose a custom header out of the subcomponents
   */
  headerTemplate?: (item: T, index: number, indent: Array<PanelFragment>, expander: PanelFragment, headerContent: PanelFragment, view: TreeItem) => PanelFragment;

  /**
   * template to render each item belonging to the bound item
   * use this template to define your own items presenter template
   */
  itemsTemplate?: (items: IterableLike<T> | undefined, view: TreeItem) => PanelFragment;
}

export interface TreeItemRenderProps {
  /**
   * tree node depth (defaults to 0)
   * this should not be assigned unless defining your own itemsTemplate
   */
  depth?: number;

  /**
   * set the isExpanded intial state (modified existing state)
   */
  startExpanded?: boolean;

  /**
   * override the current expansion state (does not modify state)
   * true will override isExpanded to true, false will not override the current state
   * use a function to handle async changes in state overrides where override logic is computerd
   * outside the treeitem container component (i.e., outside the treeview).
   */
  overrideExpanded?: boolean | (() => boolean);

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
   * flag to enable clicking anywhere on the node to toggle expansion state
   */
  clickToExpand?: boolean;
}

export interface TreeItemFacadeProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends TreeItemSourceProps<T>, TreeItemTemplateProps<T>, TreeItemRenderProps, ItemsPresenterTemplateProps<T>, PanelItemProps<T, TContext>, PanelRenderProps {
}

export interface TreeItemProps<T = {}, TContext extends PanelItemContext = PanelItemContext> extends TreeItemFacadeProps<T, TContext> {
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
  static defaultProps: Partial<TreeItemProps> = {
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
        overrideExpanded={ props.overrideExpanded }
        expandedIconName={ props.expandedIconName }
        collapsedIconName={ props.collapsedIconName }
        clickToExpand={ props.clickToExpand }
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
      <div className='TreeItem-Header' onClick={ view.props.clickToExpand ? view.toggleExpansion.bind(view) : undefined }>
        { indent }
        <div className='TreeItem-Expander'>
          { expander }
        </div>
        <div className='TreeItem-HeaderContent'>{ headerContent }</div>
      </div>
    );
  }

  public static defaultItemsTemplate(items: IterableLike<{}> | undefined, view: TreeItem) {
    const isExpanded = view.getIsExpanded();

    return (isExpanded === false || items == null) ? false : (
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

  constructor(props: TreeItemComponentProps, context?: any) {
    super(props, context);

    this.state = {
      isExpanded: this.props.startExpanded || false,
    };
  }

  componentWillReceiveProps(nextProps: Readonly<TreeItemComponentProps>, nextContext: any) {
    if (nextProps.startExpanded != null && nextProps.startExpanded !== this.state.isExpanded) {
      this.setState((prevState, props) => {
        // props.startExpanded should not be null (as per above) but we do a check just in case
        if (props.startExpanded == null) {
          return prevState;
        }

        return {
          isExpanded: props.startExpanded,
        };
      });
    }
  }

  render() {
    const { className, props, rest, children } = this.restProps(x => {
      const { item, index, itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, overrideExpanded, expandedIconName, collapsedIconName, clickToExpand, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent } = x;
      return { item, index, itemsSource, expanderIconTemplate, headerTemplate, itemsTemplate, depth, startExpanded, overrideExpanded, expandedIconName, collapsedIconName, clickToExpand, viewTemplate, itemsPanelTemplate, itemTemplate, itemClassName, itemStyle, itemProps, compact, emptyContent };
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

  protected getIsExpanded() {
    if (this.props.overrideExpanded != null) {
      // if an override prop is provided, then check to see if it is set to true
      const override = this.props.overrideExpanded instanceof Function ?
        this.props.overrideExpanded() :
        this.props.overrideExpanded;

      if (override) {
        // override is set to true so return true for isExpanded state (overridden)
        return true;
      }
    }

    // either no override prop is provided or the override result was false
    // so fallback onto standard component state
    return this.state.isExpanded || false;
  }

  protected toggleExpansion(e: MouseEvent) {
    e.stopPropagation();

    this.setState((prevState, props) => {
      return {
        isExpanded: !this.state.isExpanded,
      };
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
    const isExpanded = this.getIsExpanded();

    return template(isExpanded, this.props.expandedIconName, this.props.collapsedIconName);
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

    return itemTemplate(this.props.item, this.props.index, this.state);
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
