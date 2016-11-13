import * as React from 'react';
import { Observable } from 'rx';
import { Enumerable } from 'ix';
import * as wx from 'webrx';
import * as classNames from 'classnames';
import { Icon } from 'react-fa';
import { ListGroup, ListGroupProps, ListGroupItem } from 'react-bootstrap';

import { BaseView, ViewModelProps } from '../../React/BaseView';
import { CommandButton } from '../CommandButton/CommandButton';
import { ListViewModel } from './ListViewModel';
import { bindEventToCommand } from '../../React/BindingHelpers';
import { renderConditional } from '../../React/RenderHelpers';

import './List.less';

export interface ListViewRenderTemplate<TData> {
  initialize(viewModel: ListViewModel<TData, any>, view: ListView): void;
  cleanup(viewModel: ListViewModel<TData, any>, view: ListView): void;
  render(viewModel: ListViewModel<TData, any>, view: ListView): any[];
}

export abstract class BaseListViewTemplate<TItem, TData> implements ListViewRenderTemplate<TData> {
  public static displayName = 'BaseListViewTemplate';

  constructor(
    protected itemDataSelector: (x: TItem) => TData,
    protected renderItem: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any = (v, x) => x.toString(),
    protected getIsVisible: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => boolean = x => true,
    protected keySelector: (x: TItem, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any = (x, i) => i,
    protected renderItemContainer?: (value: () => any, x: TItem, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any
  ) {
    if (this.renderItemContainer == null) {
      this.renderItemContainer = this.renderDefaultItemContainer;
    }
  }

  protected renderDefaultItemContainer(value: () => any, item: TItem, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
    return renderConditional(this.getIsVisible(this.itemDataSelector(item), index, viewModel, view) === true, () => (
      <ListGroupItem
        key={ this.keySelector(item, index, viewModel, view) }
        active={ view.props.highlightSelected === true && viewModel.isItemSelected(this.itemDataSelector(item)) === true }
        onClick={ view.props.selectable ? bindEventToCommand(this, viewModel, x => x.selectItem, x => this.itemDataSelector(item)) : null }
      >
        { this.renderCheckmark(item, index, viewModel, view) }
        <div className='List-itemContent'>{ value() }</div>
      </ListGroupItem>
    ));
  }

  protected renderCheckmark(item: TItem, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
    return renderConditional(view.props.checkmarkSelected === true, () => (
      <Icon name={ (viewModel.isItemSelected(this.itemDataSelector(item)) === true) ? 'check-circle' : 'circle-o' } size='lg' fixedWidth />
    ));
  }

  public initialize(viewModel: ListViewModel<TData, any>, view: ListView) {
    // do nothing
  }

  public cleanup(viewModel: ListViewModel<TData, any>, view: ListView) {
    // do nothing
  }

  abstract render(viewModel: ListViewModel<TData, any>, view: ListView): any[];
}

export class ListViewTemplate<TData> extends BaseListViewTemplate<TData, TData> {
  public static displayName = 'ListViewTemplate';

  constructor(
    renderItem?: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    getIsVisible?: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => boolean,
    keySelector?: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    renderItemContainer?: (value: () => any, x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any
  ) {
    super(x => x, renderItem, getIsVisible, keySelector, renderItemContainer);
  }

  render(viewModel: ListViewModel<TData, any>, view: ListView) {
    return (viewModel.items() || [])
      .map((x, i) => this.renderItemContainer(() => this.renderItem(x, i, viewModel, view), x, i, viewModel, view));
  }
}

export interface TreeNode<TData> {
  item: TData;
  index: number;
  level: number;
  nodes: TreeNode<TData>[];
  key: any;
  isExpanded: boolean;
}

export class TreeViewTemplate<TData> extends BaseListViewTemplate<TreeNode<TData>, TData> {
  public static displayName = 'TreeViewTemplate';

  private nodes: wx.IObservableReadOnlyProperty<TreeNode<TData>[]>;
  private items: wx.IObservableReadOnlyProperty<TreeNode<TData>[]>;
  private toggleNode: wx.ICommand<TreeNode<TData>>;
  private lastKey = 0;

  constructor(
    protected getItems: (x: TData, viewModel: ListViewModel<TData, any>, view: ListView) => TData[],
    renderItem?: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    getIsVisible?: (x: TData, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => boolean,
    keySelector: (x: TreeNode<TData>, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any = x => x.key,
    renderItemContainer?: (value: () => any, x: TreeNode<TData>, i: number, viewModel: ListViewModel<TData, any>, view: ListView) => any
  ) {
    super(x => x.item, renderItem, getIsVisible, keySelector, renderItemContainer);

    this.toggleNode = wx.asyncCommand((x: TreeNode<TData>) => {
      if (x != null) {
        x.isExpanded = !x.isExpanded;
      }

      return Observable.of(x);
    });
  }

  initialize(viewModel: ListViewModel<TData, any>, view: ListView) {
    this.nodes = wx
      .whenAny(viewModel.items, x => x || [])
      .map(nodes => {
        return nodes
          .map((x, i) => this.getNode(x, i, 0, viewModel, view));
      })
      .toProperty();

    this.items = wx
      .whenAny(this.nodes, this.toggleNode.results.startWith(null), x => x || [])
      .map(x => this.getExpandedNodes(x))
      .do(x => {
        if (x != null) {
          viewModel.notifyChanged();
        }
      })
      .toProperty([]);
  }

  cleanup(viewModel: ListViewModel<TData, any>, view: ListView) {
    if (this.nodes != null) {
      this.nodes.dispose();
      this.nodes = null;
    }

    if (this.items != null) {
      this.items.dispose();
      this.items = null;
    }
  }

  render(viewModel: ListViewModel<TData, any>, view: ListView) {
    return renderConditional(this.items != null, () => {
      return (this.items() || [])
        .map((x, i) => {
          x.key = this.keySelector(x, i, viewModel, view) || `${ x.level }.${ x.index }`;

          return this.renderItemContainer(() => this.renderTreeNode(x, viewModel, view), x, i, viewModel, view);
        });
    });
  }

  protected renderTreeNode(node: TreeNode<TData>, viewModel: ListViewModel<TData, any>, view: ListView) {
    return (
      <div>
        { this.renderIndent(node, viewModel, view) }
        { this.renderExpander(node, viewModel, view) }
        <div className='TreeNode-content'>
          { this.renderItem(node.item, node.level, viewModel, view) }
        </div>
      </div>
    );
  }

  protected renderIndent(node: TreeNode<TData>, viewModel: ListViewModel<TData, any>, view: ListView) {
    return (
      <div className='TreeNode-indent' style={({ width: node.level * 10 })}>&nbsp;</div>
    );
  }

  protected renderExpander(node: TreeNode<TData>, viewModel: ListViewModel<TData, any>, view: ListView) {
    const emptyExpander = (
      <div className='TreeNode-expander'></div>
    );

    return renderConditional(node.nodes.length > 0, () => (
      <CommandButton className='TreeNode-expander' componentClass='div' bsStyle='link' command={ this.toggleNode } commandParameter={ node }>
        <Icon name={ node.isExpanded === true ? 'minus-square-o' : 'plus-square-o' } size='lg' />
      </CommandButton>
    ), () => emptyExpander);
  }

  protected getNode(item: TData, index: number, level: number, viewModel: ListViewModel<TData, any>, view: ListView): TreeNode<TData> {
    const node = {
      item,
      index,
      level,
      nodes: (this.getItems(item, viewModel, view) || [])
        .map((x, i) => this.getNode(x, i, level + 1, viewModel, view)),
      key: ++this.lastKey,
      isExpanded: false,
    } as TreeNode<TData>;

    node.key = this.keySelector(node, index, viewModel, view) || node.key;

    return node;
  }

  protected getExpandedNodes(nodes: TreeNode<TData>[], expandedNodes: TreeNode<TData>[] = []): TreeNode<TData>[] {
    nodes
      .forEach(x => {
        expandedNodes.push(x);

        if (x.isExpanded) {
          this.getExpandedNodes(x.nodes, expandedNodes);
        }
      });

    return expandedNodes;
  }

  protected flattenNodes(nodes: Enumerable<TreeNode<TData>>): Enumerable<TreeNode<TData>> {
    return nodes
      .selectMany(x => this.flattenNodes(x.nodes.asEnumerable()))
      .concat(nodes);
  }
}

export interface ListProps extends ListGroupProps, ViewModelProps {
  view?: ListViewRenderTemplate<any>;
  selectable?: boolean;
  highlightSelected?: boolean;
  checkmarkSelected?: boolean;
}

export class ListView extends BaseView<ListProps, ListViewModel<any, any>> {
  public static displayName = 'ListView';

  static defaultProps = {
    view: new ListViewTemplate<any>(),
    selectable: false,
    highlightSelected: false,
    checkmarkSelected: false,
  };

  initialize() {
    super.initialize();

    this.props.view.initialize(this.state, this);
  }

  updated(prevProps: ListProps) {
    // if the view was changed then we need to re-init
    if (prevProps.view !== this.props.view) {
      // cleanup old view
      prevProps.view.cleanup(this.state, this);

      // initialize new view
      this.props.view.initialize(this.state, this);
    }
  }

  cleanup() {
    super.cleanup();

    this.props.view.cleanup(this.state, this);
  }

  updateOn() {
    return [
      this.state.items.changed,
      this.state.selectedItem.changed,
    ];
  }

  render() {
    const { props, rest } = this.restProps(x => {
      const { view, selectable, highlightSelected, checkmarkSelected, className } = x;
      return { view, selectable, highlightSelected, checkmarkSelected, className };
    });

    return (
      <ListGroup { ...rest } className={ classNames('List', props.className) }>
        {
          (this.props.view.render(this.state, this) || [])
            .asEnumerable()
            .defaultIfEmpty(
              <div key='empty' className='List-empty text-muted'>Nothing to Display...</div>
            )
            .toArray()
        }
      </ListGroup>
    );
  }
}
