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
import { renderConditional } from '../../React/RenderHelpers';

export * from './NavButton';

import './List.less';

export interface ListViewRenderTemplateProps {
  viewTemplate?: ListViewRenderTemplate<any, any, any>;
  selectable?: boolean;
  highlightSelected?: boolean;
  checkmarkSelected?: boolean;
  emptyContent?: any | ((viewModel: ListViewModel<any, any>, view: React.Component<ListViewRenderTemplateProps, any>) => any);
}

export interface ListViewRenderTemplate<TData, TViewModel extends ListViewModel<TData, any>, TView extends React.Component<ListViewRenderTemplateProps, any>> {
  initialize(viewModel: ListViewModel<TData, any>, view: TView): void;
  cleanup(viewModel: ListViewModel<TData, any>, view: TView): void;
  render(viewModel: ListViewModel<TData, any>, view: TView): any;
}

export abstract class BaseListViewTemplate<TItem, TData, TViewModel extends ListViewModel<TData, any>, TView extends React.Component<ListViewRenderTemplateProps, any>> implements ListViewRenderTemplate<TData, TViewModel, TView> {
  public static displayName = 'BaseListViewTemplate';

  constructor(
    protected renderItem: (item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) => any = (x, data) => data.toString(),
    protected renderItemActions?: (item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) => any,
    protected keySelector: (item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) => any = (x, d, index) => index,
    protected renderTemplateContainer?: (content: any, item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) => any,
  ) {
    this.renderTemplateContainer = this.renderTemplateContainer || this.renderDefaultTemplateContainer;
  }

  private renderDefaultTemplateContainer(content: any, item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) {
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

  protected renderRow(item: TItem, index: number, viewModel: TViewModel, view: TView) {
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

  protected renderCheckmark(item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) {
    return renderConditional(view.props.checkmarkSelected === true, () => (
      <div className='List-itemSelection'>
        <CommandButton plain command={ viewModel.selectItem } commandParameter={ data }>
          <Icon name={ (viewModel.isItemSelected(data) === true) ? 'check-circle' : 'circle-o' } size='lg' fixedWidth />
        </CommandButton>
      </div>
    ));
  }

  protected renderItemContainer(item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView): any {
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

  protected renderItemTemplate(item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) {
    return (
      <div className='List-itemTemplate'>
        { this.renderItem(item, data, index, viewModel, view) }
      </div>
    );
  }

  protected renderActions(item: TItem, data: TData, index: number, viewModel: TViewModel, view: TView) {
    return renderConditional(this.renderItemActions != null, () => (
      <div className='List-itemActions'>
        { this.renderItemActions(item, data, index, viewModel, view) }
      </div>
    ));
  }

  protected renderEmptyContent(viewModel: TViewModel, view: TView) {
    return renderConditional(view.props.emptyContent instanceof Function, () => {
      return view.props.emptyContent.apply(this, [ viewModel, view ]);
    }, () => view.props.emptyContent);
  }

  protected getClassName(): string {
    return null;
  }

  protected abstract getItems(viewModel: TViewModel, view: TView): TItem[];
  protected abstract getItemData(item: TItem, index: number, viewModel: TViewModel, view: TView): TData;

  public initialize(viewModel: TViewModel, view: TView) {
    // do nothing
  }

  public cleanup(viewModel: TViewModel, view: TView) {
    // do nothing
  }

  public render(viewModel: TViewModel, view: TView) {
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

export class ListViewTemplate<TData> extends BaseListViewTemplate<TData, TData, ListViewModel<TData, any>, ListView> {
  public static displayName = 'ListViewTemplate';

  constructor(
    renderItem?: (item: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    renderItemActions?: (item: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    keySelector?: (item: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    renderItemContainer?: (content: any, item: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
  ) {
    super(
      renderItem == null ? undefined : (item, data, index, viewModel, view) => renderItem(data, index, viewModel, view),
      renderItemActions == null ? undefined : (item, data, index, viewModel, view) => renderItemActions(data, index, viewModel, view),
      keySelector == null ? undefined : (item, data, index, viewModel, view) => keySelector(data, index, viewModel, view),
      renderItemContainer == null ? undefined : (content, item, data, index, viewModel, view) => renderItemContainer(content, data, index, viewModel, view),
    );
  }

  getItems(viewModel: ListViewModel<TData, any>, view: ListView) {
    return viewModel.items();
  }

  getItemData(item: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
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

export class TreeViewTemplate<TData> extends BaseListViewTemplate<TreeNode<TData>, TData, ListViewModel<TData, any>, ListView> {
  public static displayName = 'TreeViewTemplate';

  private nodes: wx.IObservableReadOnlyProperty<TreeNode<TData>[]>;
  private items: wx.IObservableReadOnlyProperty<TreeNode<TData>[]>;
  private toggleNode: wx.ICommand<TreeNode<TData>>;
  private lastKey = 0;

  constructor(
    protected getNestedData: (data: TData, viewModel: ListViewModel<TData, any>, view: ListView) => TData[],
    renderItem?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    renderItemActions?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    keySelector?: (node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
    renderItemContainer?: (content: any, node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) => any,
  ) {
    super(renderItem, renderItemActions, keySelector, renderItemContainer);

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

  getClassName() {
    return 'Tree';
  }

  getItems(viewModel: ListViewModel<TData, any>, view: ListView) {
    return this.items();
  }

  getItemData(node: TreeNode<TData>, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
    return node.data;
  }

  renderItemContainer(node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
    return [
      this.renderIndent(node, data, index, viewModel, view),
      this.renderExpander(node, data, index, viewModel, view),
      React.cloneElement(super.renderItemContainer(node, data, index, viewModel, view), { key: 'content' }),
    ];
  }

  protected renderIndent(node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
    return (
      <div key='indent' className='TreeNode-indent'>
        <div style={ ({ width: node.level * 10 }) }>&nbsp;</div>
      </div>
    );
  }

  protected renderExpander(node: TreeNode<TData>, data: TData, index: number, viewModel: ListViewModel<TData, any>, view: ListView) {
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

  protected getNode(data: TData, index: number, level: number, viewModel: ListViewModel<TData, any>, view: ListView): TreeNode<TData> {
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

    this.props.viewTemplate.initialize(this.state, this);
  }

  updated(prevProps: ListProps) {
    // if the view was changed then we need to re-init
    if (prevProps.viewTemplate !== this.props.viewTemplate) {
      // cleanup old view
      prevProps.viewTemplate.cleanup(this.state, this);

      // initialize new view
      this.props.viewTemplate.initialize(this.state, this);
    }
  }

  cleanup() {
    super.cleanup();

    this.props.viewTemplate.cleanup(this.state, this);
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

    const list = props.viewTemplate.render(this.state, this);

    return React.cloneElement(
      list,
      Object.assign({ className: classNames('List', list.props.className, className) }, rest),
    );
  }
}
