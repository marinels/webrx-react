'use strict';

import * as React from 'react';

import { ListGroup, ListGroupItem, Button, Glyphicon } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import ListViewModel from './ListViewModel';

interface IListViewTemplate {
  getRows(view: ListView, items: any[]): any;
}

export class ListViewTemplate<T> implements IListViewTemplate {
  constructor(private renderItem: (x: T, i: number) => any) {
  }

  getRows(view: ListView, items: T[]) {
    return items.map((x, i) => this.renderItem(x, i));
  }
}

export class TreeViewTemplate<T> implements IListViewTemplate {
  constructor(private renderItem: (x: T, i: number) => any, private getItems: (x: T) => T[], private isExpanded: (x: T) => boolean) {
  }

  getRows(view: ListView, items: T[]) {
    let result: any[] = [];

    this.getNodes(result, items, 0);

    return result;
  }

  private getNodes(result: any[], items: T[], level: number) {
    items.forEach((x, i) => {
      let subItems = this.getItems(x);
      let isExpanded = this.isExpanded(x);
      let expander: any;

      if (subItems && subItems.length > 0) {
        // TODO: onClick
        expander = (
          <div className='TreeItem-Button'>
            <Button bsStyle='link' bsSize='xsmall' componentClass='span'>
              <Glyphicon glyph={isExpanded ? 'triangle-bottom' : 'triangle-right'} />
            </Button>
          </div>
        );
      } else {
        expander = (
          <div className='TreeItem-ButtonIndent' />
        );
      }

      let nodeIndents: any[] = [];
      if (level > 0) {
        for (let l = 0; l < level; ++l) {
          nodeIndents.push(<span key={l} className='TreeItem-LevelIndent' />);
        }
      }

      // TODO: active, onClick
      let item = (
        <ListGroupItem key={String.format('{0}.{1}', level, i)} bsSize='xsmall'>
          {nodeIndents}
          {expander}
          {this.renderItem(x, i)}
        </ListGroupItem>
      );

      result.push(item);

      if (isExpanded) {
        this.getNodes(result, subItems, level + 1);
      }
    });
  }
}

interface IListProps extends IBaseViewProps {
  dataTemplate: IListViewTemplate;
}

export class ListView extends BaseView<IListProps, ListViewModel<any>> {
  render() {
    return (
      <div className='List'>
        {this.props.dataTemplate.getRows(this, this.state.items.toArray())}
      </div>
    );
  }
}

export default ListView;
