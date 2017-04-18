import * as React from 'react';
import { Observable } from 'rx';
import { Enumerable } from 'ix';
import * as classNames from 'classnames';
import { Icon } from 'react-fa';
import { ListGroup, ListGroupProps, ListGroupItem } from 'react-bootstrap';

import { wx } from '../../../WebRx';
import { BaseView, ViewModelProps } from '../../React/BaseView';
import { CommandButton } from '../CommandButton/CommandButton';
import { ListViewModel } from './ListViewModel';
import { renderConditional, renderNullable } from '../../React/RenderHelpers';

export * from './NavButton';

import './List.less';

type ReadonlyListViewModel<TData> = Readonly<ListViewModel<TData, any>>;

export interface ListViewRenderTemplateProps {
  viewTemplate?: ListViewRenderTemplate<any, any>;
  selectable?: boolean;
  highlightSelected?: boolean;
  checkmarkSelected?: boolean;
  emptyContent?: any | ((viewModel: ReadonlyListViewModel<any>, view: React.Component<ListViewRenderTemplateProps, any>) => any);
}

export interface ListViewRenderTemplate<TData, TView extends React.Component<ListViewRenderTemplateProps, any>> {
  initialize(viewModel: ReadonlyListViewModel<TData>, view: TView): void;
  cleanup(viewModel: ReadonlyListViewModel<TData>, view: TView): void;
  render(viewModel: ReadonlyListViewModel<TData>, view: TView): any;
}

export abstract class BaseListViewTemplate<TItem, TData, TView extends React.Component<ListViewRenderTemplateProps, any>> implements ListViewRenderTemplate<TData, TView> {
  public static displayName = 'BaseListViewTemplate';

  protected renderTemplateContainer: (content: any, item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) => any;

  constructor(
    protected renderItem: (item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) => any = (x, data) => data.toString(),
    protected renderItemActions?: (item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) => any,
    protected keySelector: (item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) => any = (x, d, index) => index,
    renderTemplateContainer?: (content: any, item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) => any,
  ) {
    this.renderTemplateContainer = renderTemplateContainer || this.renderDefaultTemplateContainer;
  }

  protected renderDefaultTemplateContainer(content: any, item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return renderConditional(
      view.props.selectable === true,
      () => (
        <CommandButton className='List-templateContainer' block plain command={ viewModel.selectItem } commandParameter={ data } >
          { content }
        </CommandButton>
      ),
      () => (
        <div className='List-templateContainer'>
          { content }
        </div>
      ),
    );
  }

  protected renderRow(item: TItem, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) {
    const data = this.getItemData(item, index, viewModel, view);

    return (
      <ListGroupItem className='List-row'
        key={ this.keySelector(item, data, index, viewModel, view) }
        active={ view.props.highlightSelected === true && viewModel.isItemSelected(data) === true }
      >
        { this.renderCheckmark(item, data, index, viewModel, view) }
        { this.renderItemContainer(item, data, index, viewModel, view) }
        { this.renderActions(item, data, index, viewModel, view) }
      </ListGroupItem>
    );
  }

  protected renderCheckmark(item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return renderConditional(view.props.checkmarkSelected === true, () => (
      <div className='List-itemSelection'>
        <CommandButton plain command={ viewModel.selectItem } commandParameter={ data }>
          <Icon name={ (viewModel.isItemSelected(data) === true) ? 'check-circle' : 'circle-o' } size='lg' fixedWidth />
        </CommandButton>
      </div>
    ));
  }

  protected renderItemContainer(item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView): any {
    return (
      <div className='List-itemContainer'>
        {
          this.renderTemplateContainer(
            this.renderItemTemplate(item, data, index, viewModel, view),
            item,
            data,
            index,
            viewModel,
            view,
          )
        }
      </div>
    );
  }

  protected renderItemTemplate(item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return (
      <div className='List-itemTemplate'>
        { this.renderItem(item, data, index, viewModel, view) }
      </div>
    );
  }

  protected renderActions(item: TItem, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return renderNullable(this.renderItemActions, renderItemActions => (
      <div className='List-itemActions'>
        { renderItemActions(item, data, index, viewModel, view) }
      </div>
    ));
  }

  protected renderEmptyContent(viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return renderConditional(view.props.emptyContent instanceof Function, () => {
      return view.props.emptyContent.apply(this, [ viewModel, view ]);
    }, () => view.props.emptyContent);
  }

  protected getClassName(): string {
    return '';
  }

  protected abstract getItems(viewModel: ReadonlyListViewModel<TData>, view: TView): TItem[];
  protected abstract getItemData(item: TItem, index: number, viewModel: ReadonlyListViewModel<TData>, view: TView): TData;

  public initialize(viewModel: ReadonlyListViewModel<TData>, view: TView) {
    // do nothing
  }

  public cleanup(viewModel: ReadonlyListViewModel<TData>, view: TView) {
    // do nothing
  }

  public render(viewModel: ReadonlyListViewModel<TData>, view: TView) {
    return (
      <ListGroup className={ this.getClassName() }>
        {
          (this.getItems(viewModel, view) || [])
            .map((x, i) => this.renderRow(x, i, viewModel, view))
            .asEnumerable()
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

export class ListViewTemplate<TData> extends BaseListViewTemplate<TData, TData, ListView> {
  public static displayName = 'ListViewTemplate';

  constructor(
    renderItem?: (item: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    renderItemActions?: (item: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    keySelector?: (item: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    renderTemplateContainer?: (content: any, item: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
  ) {
    super(
      renderItem == null ? undefined : (item, data, index, viewModel, view) => renderItem(data, index, viewModel, view),
      renderItemActions == null ? undefined : (item, data, index, viewModel, view) => renderItemActions(data, index, viewModel, view),
      keySelector == null ? undefined : (item, data, index, viewModel, view) => keySelector(data, index, viewModel, view),
      renderTemplateContainer == null ? undefined : (content, item, data, index, viewModel, view) => renderTemplateContainer(content, data, index, viewModel, view),
    );
  }

  getItems(viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return viewModel.items();
  }

  getItemData(item: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return item;
  }
}

export interface TreeNode<TData> {
  data: TData;
  index: number;
  level: number;
  nodes: TreeNode<TData>[];
  key: any;
  isExpanded: boolean;
}

export class TreeViewTemplate<TData> extends BaseListViewTemplate<TreeNode<TData>, TData, ListView> {
  public static displayName = 'TreeViewTemplate';

  protected nodes: wx.IObservableReadOnlyProperty<TreeNode<TData>[]> | undefined;
  protected items: wx.IObservableReadOnlyProperty<TreeNode<TData>[]> | undefined;
  protected toggleNode: wx.ICommand<TreeNode<TData> | undefined>;
  protected lastKey = 0;

  constructor(
    protected getNestedData: (data: TData, viewModel: ReadonlyListViewModel<TData>, view: ListView) => TData[],
    renderItem?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    renderItemActions?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    keySelector?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
    renderTemplateContainer?: (content: any, node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) => any,
  ) {
    super(renderItem, renderItemActions, keySelector, renderTemplateContainer);

    this.toggleNode = wx.asyncCommand((x: TreeNode<TData>) => {
      if (x != null) {
        x.isExpanded = !x.isExpanded;
      }

      return Observable.of(x);
    });
  }

  initialize(viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    this.nodes = wx
      .whenAny(viewModel.items, x => x || [])
      .map(nodes => {
        return nodes
          .map((x, i) => this.getNode(x, i, 0, viewModel, view));
      })
      .toProperty();

    this.items = wx
      .whenAny(this.nodes, this.toggleNode.results.startWith(undefined), x => x || [])
      .map(x => this.getExpandedNodes(x))
      .do(x => {
        if (x != null) {
          viewModel.notifyChanged();
        }
      })
      .toProperty([]);
  }

  cleanup(viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    this.nodes = Object.dispose(this.nodes);
    this.items = Object.dispose(this.items);
  }

  getClassName() {
    return 'Tree';
  }

  getItems(viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return this.items == null ? [] : this.items();
  }

  getItemData(node: TreeNode<TData>, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return node.data;
  }

  renderItemContainer(node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return [
      this.renderIndent(node, data, index, viewModel, view),
      this.renderExpander(node, data, index, viewModel, view),
      React.cloneElement(super.renderItemContainer(node, data, index, viewModel, view), { key: 'content' }),
    ];
  }

  protected renderIndent(node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return (
      <div key='indent' className='TreeNode-indent'>
        <div style={ ({ width: node.level * 10 }) }>&nbsp;</div>
      </div>
    );
  }

  protected renderExpander(node: TreeNode<TData>, data: TData, index: number, viewModel: ReadonlyListViewModel<TData>, view: ListView) {
    return (
      <div key='expander' className='TreeNode-expander'>
        {
          renderConditional(node.nodes.length > 0, () => (
            <CommandButton plain command={ this.toggleNode } commandParameter={ node }>
              <Icon name={ node.isExpanded === true ? 'minus-square-o' : 'plus-square-o' } size='lg' fixedWidth />
            </CommandButton>
          ), () => (
            <Icon name='' size='lg' fixedWidth />
          ))
        }
      </div>
    );
  }

  protected getNode(data: TData, index: number, level: number, viewModel: ReadonlyListViewModel<TData>, view: ListView): TreeNode<TData> {
    const node = {
      data,
      index,
      level,
      nodes: (this.getNestedData(data, viewModel, view) || [])
        .map((x, i) => this.getNode(x, i, level + 1, viewModel, view)),
      key: ++this.lastKey,
      isExpanded: false,
    } as TreeNode<TData>;

    node.key = this.keySelector(node, data, index, viewModel, view) || node.key;

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

export interface ListProps extends ListGroupProps, ListViewRenderTemplateProps, ViewModelProps {
}

export class ListView extends BaseView<ListProps, ListViewModel<any, any>> {
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
      Object.assign({ className: classNames('List', list.props.className, className) }, rest),
    );
  }
}
