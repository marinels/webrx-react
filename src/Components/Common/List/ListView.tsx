'use strict';

import * as React from 'react';

import { ListGroup, ListGroupItem, ListGroupItemProps, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import Icon from '../Icon/Icon';

import { ListViewModel, ISelectableItem } from './ListViewModel';

import './ListView.less';

interface IView {
  getRows(view: ListView, items: any[]): JSX.Element[];
}

export class StandardView<T> implements IView {
  public static displayName = 'StandardView';

  constructor(
    protected renderItem: (view: ListView, x: T, i: number) => any = (v, x) => x.toString(),
    protected getProps?: (view: ListView, x: T, i: number) => ListGroupItemProps) {
  }

  createListItemProps(view: ListView, item: T, index: number) {
    return this.getProps == null ? {} as ListGroupItemProps : this.getProps(view, item, index);
  }

  getRows(view: ListView, items: T[]) {
    return items.map((x, i) => {
      let props = this.createListItemProps(view, x, i);

      if (props.key == null) {
        props.key = i;
      }

      if (props.active == null && (view.props.trackActive || view.props.multiSelect || false)) {
        props.active = view.isSelected(x, i);
      }

      if (props.onClick == null) {
        props.onClick = () => view.selectItem(x, i);
      }

      return (
        <ListGroupItem {...props}>
          {this.renderItem(view, x, i)}
        </ListGroupItem>
      );
    });
  }
}

export class TreeView<T> extends StandardView<T> {
  public static displayName = 'TreeView';

  constructor(
    private getIsExpanded: (x: T, i: number) => boolean,
    private setIsExpanded: (x: T, i: number, isExpanded: boolean) => void,
    private getItems: (x: T, i: number) => T[],
    private selectOnExpand = false,
    private expandOnSelect = false,
    renderItem?: (view: ListView, x: T, i: number) => any,
    getProps?: (view: ListView, x: T, i: number) => ListGroupItemProps) {
    super(renderItem, getProps);
  }

  getRows(view: ListView, items: T[]) {
    let result: JSX.Element[] = [];

    this.getNodes(view, result, items);

    return result;
  }

  private getNodes(view: ListView, result: any[], items: T[], level = 0, key = '') {
    items.forEach((x, i) => {
      let subItems = this.getItems(x, i);
      let isExpanded = this.getIsExpanded(x, i);
      let expander: any;

      if (subItems != null && subItems.length > 0) {
        let onExpanderClick = (e: React.MouseEvent) => {
          e.preventDefault();

          this.setIsExpanded(x, i, !isExpanded);

          if (this.selectOnExpand === true && view.isSelected(x) === false) {
            view.selectItem(x);
          } else {
            view.forceUpdate();
          }
        };
        expander = (
          <span className='TreeItem-button'>
            <Button className='fa' bsStyle='link' bsSize='xsmall' componentClass='span' onClick={onExpanderClick}>
              <Icon name={isExpanded === true ? 'fa-minus-square-o' : 'fa-plus-square-o'} size='lg' fixedWidth />
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

      if (props.key == null) {
        props.key = String.format('{0}.{1}', key, i);
      }

      if (props.active == null && (view.props.trackActive || view.props.multiSelect || false)) {
        props.active = view.isSelected(x);
      }

      if (props.onClick == null) {
        props.onClick = (e) => {
          if (e.defaultPrevented === false) {
            if (this.expandOnSelect === true && subItems != null && subItems.length > 0) {
              this.setIsExpanded(x, i, !isExpanded);
            }

            if (view.isSelected(x) === true) {
              view.state.stateChanged.execute(null);
            }

            view.selectItem(x);
          }
        };
      }

      let item = (
        <ListGroupItem {...props}>
          <div className='list-group-item-expander'>
            {nodeIndents}
            {expander}
          </div>
          <div className='list-group-item-content'>
            {this.renderItem(view, x, i)}
          </div>
        </ListGroupItem>
      );

      result.push(item);

      if (isExpanded === true) {
        this.getNodes(view, result, subItems, level + 1, props.key);
      }
    });
  }
}

interface IListProps extends IBaseViewProps {
  view?: IView;
  trackActive?: boolean;
  multiSelect?: boolean;
}

export class ListView extends BaseView<IListProps, ListViewModel<any, any>> {
  public static displayName = 'ListView';
  
  static defaultProps = {
    view: new StandardView(),
    trackActive: false,
    multiSelect: false
  }

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
    ]
  }

  render() {
    return (
      <div className='List'>
        <ListGroup>
          {this.props.view.getRows(this, this.state.items.toArray())}
        </ListGroup>
      </div>
    );
  }
}

export default ListView;
