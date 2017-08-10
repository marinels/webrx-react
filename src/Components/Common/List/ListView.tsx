import * as React from 'react';
import { Observable, Subscription } from 'rxjs';
import { Iterable } from 'ix';
import { Icon } from 'react-fa';
import { ListGroup, ListGroupProps, ListGroupItem } from 'react-bootstrap';

import { wx, ReadOnlyProperty, Command } from '../../../WebRx';
import { wxr, BaseView, ViewModelProps } from '../../React';
import { CommandButton } from '../CommandButton/CommandButton';
import { ListViewModel } from './ListViewModel';

export * from './NavButton';

export type ReadonlyListViewModel<TItem> = Readonly<ListViewModel<any, TItem, any>>;

export interface ListViewRenderTemplateProps {
  viewTemplate?: ListViewRenderTemplate<any, any>;
  selectable?: boolean;
  highlightSelected?: boolean;
  checkmarkSelected?: boolean;
  emptyContent?: any | ((viewModel: ReadonlyListViewModel<any>, view: React.Component<ListViewRenderTemplateProps, any>) => any);
}

export interface ListViewRenderTemplate<TItem, TView extends React.Component<ListViewRenderTemplateProps, any>> {
  initialize(viewModel: ReadonlyListViewModel<TItem>, view: TView): void;
  cleanup(viewModel: ReadonlyListViewModel<TItem>, view: TView): void;
  render(viewModel: ReadonlyListViewModel<TItem>, view: TView): any;
}

export abstract class BaseListViewTemplate<TViewItem, TItem, TView extends React.Component<ListViewRenderTemplateProps, any>> implements ListViewRenderTemplate<TItem, TView> {
  public static displayName = 'BaseListViewTemplate';

  protected readonly renderTemplateContainer: (content: any, viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) => any;

  constructor(
    protected readonly renderItem: (viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) => any = (x, data) => data.toString(),
    protected readonly renderItemActions?: (viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) => any,
    protected readonly keySelector: (viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) => any = (x, d, index) => index,
    renderTemplateContainer?: (content: any, viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) => any,
  ) {
    this.renderTemplateContainer = renderTemplateContainer || this.renderDefaultTemplateContainer;
  }

  protected renderStandardTemplateContainer(content: any, viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return (
      <div className='List-templateContainer'>
        { content }
      </div>
    );
  }

  protected renderSelectableTemplateContainer(content: any, viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return (
      <CommandButton className='List-templateContainer' block plain command={ viewModel.selectItem } commandParameter={ item } >
        { content }
      </CommandButton>
    );
  }

  protected renderDefaultTemplateContainer(content: any, viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return wxr.renderConditional(
      view.props.selectable === true,
      () => this.renderSelectableTemplateContainer(content, viewItem, item, index, viewModel, view),
      () => this.renderStandardTemplateContainer(content, viewItem, item, index, viewModel, view),
    );
  }

  protected renderRow(viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    const item = this.getItemData(viewItem, index, viewModel, view);

    return (
      <ListGroupItem className='List-row'
        key={ this.keySelector(viewItem, item, index, viewModel, view) }
        active={ view.props.highlightSelected === true && viewModel.isItemSelected(item) === true }
      >
        { this.renderCheckmark(viewItem, item, index, viewModel, view) }
        { this.renderItemContainer(viewItem, item, index, viewModel, view) }
        { this.renderActions(viewItem, item, index, viewModel, view) }
      </ListGroupItem>
    );
  }

  protected renderCheckmark(viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return wxr.renderConditional(view.props.checkmarkSelected === true, () => (
      <div className='List-itemSelection'>
        <CommandButton plain command={ viewModel.selectItem } commandParameter={ item }>
          <Icon name={ (viewModel.isItemSelected(item) === true) ? 'check-circle' : 'circle-o' } size='lg' fixedWidth />
        </CommandButton>
      </div>
    ));
  }

  protected renderItemContainer(viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView): any {
    return (
      <div className='List-itemContainer'>
        {
          this.renderTemplateContainer(
            this.renderItemTemplate(viewItem, item, index, viewModel, view),
            viewItem,
            item,
            index,
            viewModel,
            view,
          )
        }
      </div>
    );
  }

  protected renderItemTemplate(viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return (
      <div className='List-itemTemplate'>
        { this.renderItem(viewItem, item, index, viewModel, view) }
      </div>
    );
  }

  protected renderActions(viewItem: TViewItem, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return wxr.renderNullable(this.renderItemActions, renderItemActions => (
      <div className='List-itemActions'>
        { renderItemActions(viewItem, item, index, viewModel, view) }
      </div>
    ));
  }

  protected renderEmptyContent(viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return wxr.renderConditional(view.props.emptyContent instanceof Function, () => {
      return view.props.emptyContent.apply(this, [ viewModel, view ]);
    }, () => view.props.emptyContent);
  }

  protected getClassName(): string {
    return '';
  }

  protected abstract getItems(viewModel: ReadonlyListViewModel<TItem>, view: TView): TViewItem[];
  protected abstract getItemData(viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: TView): TItem;

  public initialize(viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    // do nothing
  }

  public cleanup(viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    // do nothing
  }

  public render(viewModel: ReadonlyListViewModel<TItem>, view: TView) {
    return (
      <ListGroup className={ this.getClassName() }>
        {
          (this.getItems(viewModel, view) || [])
            .asIterable()
            .map((x, i) => this.renderRow(x, i, viewModel, view))
            .defaultIfEmpty(
              <ListGroupItem key='empty' className='List-empty text-muted'>
                { this.renderEmptyContent(viewModel, view) }
              </ListGroupItem>,
            )
            .toArray()
        }
      </ListGroup>
    );
  }
}

export class ListViewTemplate<TViewItem> extends BaseListViewTemplate<TViewItem, TViewItem, ListView> {
  public static displayName = 'ListViewTemplate';

  constructor(
    renderItem?: (viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) => any,
    renderItemActions?: (viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) => any,
    keySelector?: (viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) => any,
    renderTemplateContainer?: (content: any, viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) => any,
  ) {
    super(
      renderItem == null ? undefined : (viewItem, item, index, viewModel, view) => renderItem(item, index, viewModel, view),
      renderItemActions == null ? undefined : (viewItem, item, index, viewModel, view) => renderItemActions(item, index, viewModel, view),
      keySelector == null ? undefined : (viewItem, item, index, viewModel, view) => keySelector(item, index, viewModel, view),
      renderTemplateContainer == null ? undefined : (content, viewItem, item, index, viewModel, view) => renderTemplateContainer(content, item, index, viewModel, view),
    );
  }

  getItems(viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) {
    return viewModel.items.value;
  }

  getItemData(viewItem: TViewItem, index: number, viewModel: ReadonlyListViewModel<TViewItem>, view: ListView) {
    return viewItem;
  }
}

export interface TreeNode<TItem> {
  item: TItem;
  index: number;
  level: number;
  nodes: TreeNode<TItem>[];
  key: any;
  isExpanded: boolean;
}

export interface TreeNodeToggle<TItem> {
  node?: TreeNode<TItem>;
  item?: TItem; // TODO: needed?
  index?: number;
  viewModel?: ReadonlyListViewModel<TItem>;
  view?: ListView;
}

export class TreeViewTemplate<TItem> extends BaseListViewTemplate<TreeNode<TItem>, TItem, ListView> {
  public static displayName = 'TreeViewTemplate';

  protected nodes: ReadOnlyProperty<TreeNode<TItem>[]> | undefined;
  protected items: ReadOnlyProperty<TreeNode<TItem>[]> | undefined;
  protected readonly toggleNode: Command<TreeNode<TItem> | undefined>;
  protected lastKey = 0;

  public indentSize = 24;

  constructor(
    protected readonly getNestedData: (item: TItem, viewModel: ReadonlyListViewModel<TItem>, view: ListView) => ArrayLike<TItem>,
    renderItem?: (viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) => any,
    renderItemActions?: (viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) => any,
    keySelector?: (viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) => any,
    renderTemplateContainer?: (content: any, viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) => any,
    protected readonly autoExpand: (items: TItem[], viewModel: ReadonlyListViewModel<TItem>, view: ListView) => Observable<boolean> = () => Observable.of(false),
    protected readonly clickToExpand = false,
  ) {
    super(renderItem, renderItemActions, keySelector, renderTemplateContainer);

    this.toggleNode = wx.command((x: TreeNodeToggle<TItem>) => {
      if (x.node != null) {
        x.node.isExpanded = !x.node.isExpanded;

        if (x.index != null && x.viewModel != null && x.view != null && x.view.props.selectable === true) {
          x.viewModel.selectItem.execute(this.getItemData(x.node, x.index, x.viewModel, x.view));
        }
      }

      return x.node;
    });
  }

  protected renderDefaultTemplateContainer(content: any, viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    return wxr.renderConditional(
      view.props.selectable === true && this.clickToExpand !== true,
      () => this.renderSelectableTemplateContainer(content, viewItem, item, index, viewModel, view),
      () => this.renderStandardTemplateContainer(content, viewItem, item, index, viewModel, view),
    );
  }

  initialize(viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    this.nodes = wx
      .whenAny(viewModel.items, x => x || [])
      .switchMap(
        x => this.autoExpand(x, viewModel, view),
        (nodes, autoExpand) => ({ nodes, autoExpand }),
      )
      .map(x => {
        return x.nodes
          .map((node, i) => this.getNode(node, i, 0, viewModel, view, x.autoExpand));
      })
      .toProperty(undefined, false);

    this.items = wx
      .whenAny(this.nodes, this.toggleNode.results.startWith(undefined), x => x || [])
      .map(x => this.getExpandedNodes(x))
      .do(x => {
        if (x != null) {
          viewModel.stateChanged.execute();
        }
      })
      .toProperty([], false);
  }

  cleanup(viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    this.nodes = Subscription.unsubscribe(this.nodes);
    this.items = Subscription.unsubscribe(this.items);
  }

  getClassName() {
    return 'Tree';
  }

  getItems(viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    return this.items == null ? [] : this.items.value;
  }

  getItemData(viewItem: TreeNode<TItem>, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    return viewItem.item;
  }

  renderItemContainer(viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    const content = super.renderItemContainer(viewItem, item, index, viewModel, view);

    return [
      this.renderIndent(viewItem, item, index, viewModel, view),
      this.renderExpander(viewItem, item, index, viewModel, view),
      wxr.renderConditional(
        this.clickToExpand === true,
        () => (
          <CommandButton key='content' className='List-itemContainer' plain command={ this.toggleNode } commandParameter={ ({ viewItem, item, index, viewModel, view }) }>
            { React.isValidElement<{ children?: React.ReactNode }>(content) ? content.props.children : content }
          </CommandButton>
        ),
        () => React.cloneElement(content, { key: 'content' }),
      ),
    ];
  }

  protected renderIndent(viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    return (
      <div key='indent' className='TreeNode-indent'>
        <div style={ ({ width: viewItem.level * this.indentSize }) }>&nbsp;</div>
      </div>
    );
  }

  protected renderExpander(viewItem: TreeNode<TItem>, item: TItem, index: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView) {
    return (
      <div key='expander' className='TreeNode-expander'>
        {
          wxr.renderConditional(viewItem.nodes.length > 0, () => (
            <CommandButton plain command={ this.toggleNode } commandParameter={ ({ viewItem }) }>
              <Icon name={ viewItem.isExpanded === true ? 'minus-square-o' : 'plus-square-o' } size='lg' fixedWidth />
            </CommandButton>
          ), () => (
            <Icon name='' size='lg' fixedWidth />
          ))
        }
      </div>
    );
  }

  protected getNode(item: TItem, index: number, level: number, viewModel: ReadonlyListViewModel<TItem>, view: ListView, isExpanded = false): TreeNode<TItem> {
    const node: TreeNode<TItem> = {
      item,
      index,
      level,
      nodes: Iterable
        .from(this.getNestedData(item, viewModel, view) || [])
        .map((x, i) => this.getNode(x, i, level + 1, viewModel, view, isExpanded))
        .toArray(),
      key: ++this.lastKey,
      isExpanded,
    };

    node.key = this.keySelector(node, item, index, viewModel, view) || node.key;

    return node;
  }

  protected getExpandedNodes(nodes: TreeNode<TItem>[], expandedNodes: TreeNode<TItem>[] = []): TreeNode<TItem>[] {
    nodes
      .forEach(x => {
        expandedNodes.push(x);

        if (x.isExpanded) {
          this.getExpandedNodes(x.nodes, expandedNodes);
        }
      });

    return expandedNodes;
  }

  protected flattenNodes(nodes: Iterable<TreeNode<TItem>>): Iterable<TreeNode<TItem>> {
    return nodes
      .flatMap<TreeNode<TItem>, TreeNode<TItem>>(x => this.flattenNodes(x.nodes.asIterable()))
      .concat(nodes);
  }
}

export interface ListProps extends ListGroupProps, ListViewRenderTemplateProps, ViewModelProps {
}

export class ListView extends BaseView<ListProps, ListViewModel<any, any, any>> {
  public static displayName = 'ListView';

  static defaultProps = {
    viewTemplate: new ListViewTemplate<any>(),
    selectable: false,
    highlightSelected: false,
    checkmarkSelected: false,
    emptyContent: 'Nothing to Display...',
  };

  initialize() {
    super.initialize();

    this.props.viewTemplate!.initialize(this.state, this);
  }

  updated(prevProps: ListProps) {
    // if the view was changed then we need to re-init
    if (prevProps.viewTemplate !== this.props.viewTemplate) {
      // cleanup old view
      prevProps.viewTemplate!.cleanup(this.state, this);

      // initialize new view
      this.props.viewTemplate!.initialize(this.state, this);
    }
  }

  cleanup() {
    super.cleanup();

    this.props.viewTemplate!.cleanup(this.state, this);
  }

  updateOn() {
    return [
      this.state.items.changed,
      this.state.selectedItem.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { viewTemplate, selectable, highlightSelected, checkmarkSelected, emptyContent } = x;
      return { viewTemplate, selectable, highlightSelected, checkmarkSelected, emptyContent };
    });

    const list = props.viewTemplate!.render(this.state, this);

    return React.cloneElement(
      list,
      Object.assign({ className: this.classNames('List', list.props.className, className) }, rest),
    );
  }
}
