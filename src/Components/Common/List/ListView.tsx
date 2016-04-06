'use strict';

import * as React from 'react';
import * as classNames from 'classnames';
import * as wx from 'webrx';

import { ListGroup, ListGroupItem, ListGroupItemProps, Button } from 'react-bootstrap';

import { getLogger } from '../../../Utils/Logging/LogManager';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import * as Icon from 'react-fa';

import { ListViewModel, ISelectableItem } from './ListViewModel';

import './List.less';

export interface IListView {
  getRows(view: ListView, items: any[]): any[];
}

export class StandardListView<T> implements IListView {
  public static displayName = 'StandardView';

  constructor(
    protected getIsVisible: (x: T, i: number) => boolean = x => true,
    protected renderItem: (view: ListView, x: T, i: number) => any = (v, x) => x.toString(),
    protected getProps?: (view: ListView, x: T, i: number) => ListGroupItemProps) {
  }

  createListItemProps(view: ListView, item: T, index: number) {
    return this.getProps == null ? {} as ListGroupItemProps : this.getProps(view, item, index);
  }

  getRows(view: ListView, items: T[]) {
    return items.map((x, i) => {
      if (this.getIsVisible(x, i) === true) {
        let props = this.createListItemProps(view, x, i);
        let isSelected = view.isSelected(x, i);

        if (props.key == null) {
          props.key = i;
        }

        if (props.onClick == null) {
          props.onClick = () => view.selectItem(x, i);
        }

        let selectionIcon: any = null;
        if (view.props.checkmarkSelected === true) {
          selectionIcon = (
            <div className='list-group-item-selectionIcon'>
              { isSelected ? <Icon name='check-circle' size='lg' fixedWidth /> : null }
            </div>
          );
        }

        return (
          <div className={classNames('list-group-item', { active: isSelected })} {...props as any}>
            {selectionIcon}
            <div className='list-group-item-content' onClick={() => view.selectItem(x, i)}>
              {this.renderItem(view, x, i)}
            </div>
          </div>
        );
      }
    });
  }
}

export class TreeListView<T> extends StandardListView<T> {
  public static displayName = 'TreeView';

  private static logger = new wx.Lazy(() => getLogger(TreeListView.displayName));

  constructor(
    private getIsExpanded: (x: T, i: number) => boolean,
    private setIsExpanded: (x: T, i: number, isExpanded: boolean) => void,
    private getItems: (x: T, i: number) => T[],
    private selectOnExpand = false,
    private expandOnSelect = false,
    getIsVisible?: (x: T, i: number) => boolean,
    renderItem?: (view: ListView, x: T, i: number) => any,
    getProps?: (view: ListView, x: T, i: number) => ListGroupItemProps) {
    super(getIsVisible, renderItem, getProps);
  }

  getRows(view: ListView, items: T[]) {
    let result: JSX.Element[] = [];

    this.getNodes(view, result, items);

    return result;
  }

  private toggleExpanded(view: ListView, node: T, i: number) {
    let isExpanded = !this.getIsExpanded(node, i);
    TreeListView.logger.value.debug(`${isExpanded ? 'Expanding' : 'Collapsing'} Node`);
    this.setIsExpanded(node, i, isExpanded);
    view.state.notifyChanged();
  }

  private getNodes(view: ListView, result: any[], items: T[], level = 0, key = '') {
    items.forEach((x, i) => {
      if (this.getIsVisible(x, i) === true) {
        let subItems = this.getItems(x, i);
        let isExpanded = this.getIsExpanded(x, i);
        let expander: any;

        if (subItems != null && subItems.length > 0) {
          // this click handler deals with the expander
          let onExpanderClick = (e: React.MouseEvent) => {
            // we must call this so that the row click handler is ignored for this click
            e.preventDefault();

            this.toggleExpanded(view, x, i);

            if (this.selectOnExpand === true && view.isSelected(x) === false) {
              view.selectItem(x);
            }
          };
          expander = (
            <span className='TreeItem-button'>
              <Button className='fa' bsStyle='link' bsSize='xsmall' componentClass='span' onClick={onExpanderClick}>
                <Icon name={isExpanded === true ? 'minus-square-o' : 'plus-square-o'} size='lg' fixedWidth />
              </Button>
            </span>
          );
        } else {
          expander = (
            <span className='TreeItem-buttonIndent' />
          );
        }

        let nodeIndents: any[] = [];
        if (level > 0) {
          for (let l = 0; l < level; ++l) {
            nodeIndents.push(<span key={l} className='TreeItem-levelIndent' />);
          }
        }

        let props = this.createListItemProps(view, x, i);
        let isSelected = view.isSelected(x);

        if (props.key == null) {
          props.key = `${key}.${i}`;
        }

        if (props.onClick == null) {
          // this click handler deals with selection of the entire row
          props.onClick = (e: React.SyntheticEvent) => {
            if (e.defaultPrevented === false) {
              if (this.expandOnSelect === true && subItems != null && subItems.length > 0) {
                this.toggleExpanded(view, x, i);
              }

              view.selectItem(x);

              view.state.notifyChanged();
            }
          };
        }

        let selectionIcon: any = null;
        if (view.props.checkmarkSelected === true) {
          selectionIcon = (
            <div className='list-group-item-selectionIcon'>
              { isSelected ? <Icon name='check-circle' size='lg' fixedWidth /> : null }
            </div>
          );
        }

        let item = (
          <div className={classNames('list-group-item', { active: isSelected })} {...props as any}>
            {selectionIcon}
            <div className='list-group-item-expander'>
              {nodeIndents}
              {expander}
            </div>
            <div className='list-group-item-content'>
              {this.renderItem(view, x, i)}
            </div>
          </div>
        );

        result.push(item);

        if (isExpanded === true) {
          this.getNodes(view, result, subItems, level + 1, props.key as string);
        }
      }
    });
  }
}

interface IListProps extends IBaseViewProps {
  view?: IListView;
  highlightSelected?: boolean;
  checkmarkSelected?: boolean;
  multiSelect?: boolean;
}

export class ListView extends BaseView<IListProps, ListViewModel<any, any>> {
  public static displayName = 'ListView';

  static defaultProps = {
    view: new StandardListView(),
    highlightSelected: false,
    checkmarkSelected: false,
    multiSelect: false
  };

  public isSelected(item: any, index?: number) {
    let isSelected = false;

    if (this.props.multiSelect === true) {
      isSelected = (item as ISelectableItem).isSelected === true;
    } else {
      isSelected = index == null ? this.state.selectedItem() === item : this.state.selectedIndex() === index;
    }

    return isSelected;
  }

  public selectItem(item: any, index?: number) {
    if (index == null) {
      this.state.selectItem.execute(item);
    } else {
      this.state.selectIndex.execute(index);
    }
  }

  updateOn() {
    return [
      this.state.items.listChanged,
      this.state.selectedItem.changed
    ];
  }

  render() {
    let rows = this.props.view.getRows(this, this.state.items.toArray());

    return (
      <div className='List'>
        <ListGroup>
          {
            rows.length === 0 ? (
              <div className='List-empty'>Nothing to Display...</div>
            ) : rows
          }
        </ListGroup>
      </div>
    );
  }
}

export default ListView;
