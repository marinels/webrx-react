import { Iterable } from 'ix';
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Icon } from 'react-fa';

import { IterableLike } from '../../../WebRx';
import { wxr } from '../../React';
import { ItemsPresenterProps, ItemsPresenterTemplateProps, ItemsPresenter } from './ItemsPresenter';

export type RecursiveItemsSource<T> = (item: T) => (IterableLike<T> | undefined);

export interface TreeItemSourceProps {
  /**
   * function to produce the recursive items source for the provided item
   */
  itemsSource: RecursiveItemsSource<{}>;

  /**
   * template to render each items belonging to the bound item
   */
  itemsTemplate?: (items: IterableLike<{}> | undefined) => React.ReactNode;
}

export interface TreeItemRenderProps {
  /**
   * tree node depth (defaults to 0)
   */
  depth?: number;

  /**
   * set the isExpanded intial state
   */
  startExpanded?: boolean;
}

export interface TreeItemProps extends React.HTMLAttributes<TreeItemProps>, TreeItemSourceProps, TreeItemRenderProps, ItemsPresenterTemplateProps {
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
  isExpanded: boolean;
}

export class TreeItem extends React.Component<TreeItemProps, TreeItemState> {
  static defaultProps = {
    depth: 0,
  };

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
              viewTemplate={ view.props.viewTemplate }
              itemsPanelTemplate={ view.props.itemsPanelTemplate }
              itemTemplate={ view.props.itemTemplate }
            />
          );

          return React.cloneElement(treeItem, { key: treeItem.key || index });
        }}
      />
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
      const { item, index, itemsSource, itemsTemplate, depth, startExpanded, viewTemplate, itemsPanelTemplate, itemTemplate } = x;
      return { item, index, itemsSource, itemsTemplate, depth, startExpanded, viewTemplate, itemsPanelTemplate, itemTemplate };
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

  protected renderExpander(items: IterableLike<{}> | undefined) {
    const isEmpty = items == null || Iterable
      .from(items)
      .isEmpty();

    return isEmpty ? false : (
      <Button bsStyle='link' onClick={ () => this.toggleExpansion() }>
        <Icon name={ this.state.isExpanded === true ? 'minus-square-o' : 'plus-square-o' } size='lg' fixedWidth />
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
