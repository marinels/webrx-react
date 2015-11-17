'use strict';

import * as React from 'react';

import { Pagination, PaginationProps, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import PagerViewModel from './PagerViewModel';

import './Pager.less';

interface IPagerProps extends IBaseViewProps, PaginationProps {
  info?: boolean;
  limits?: number[];
}

export class PagerView extends BaseView<IPagerProps, PagerViewModel> {
  public static displayName = 'PagerView';

  updateOn() {
    return [
      this.state.pageCount.changed,
      this.state.selectedPage.changed
    ]
  }

  render() {
    let info: string;

    if (this.props.info && this.state.hasValidLimit()) {
      info = this.state.itemCount() === 0 ? 'No Items to Show' :
        String.format('Showing Items {0} through {1}', this.state.offset() + 1, Math.min(this.state.itemCount(), this.state.offset() + this.state.limit()));
    }

    let pager = (this.props.limits == null || this.state.itemCount() === 0) ? null : (
      <Pagination items={this.state.pageCount()} activePage={this.state.selectedPage()} onSelect={this.bindEvent(x => x.selectPage, null, (e, x) => x[0].eventKey as number)} {...this.props} />
    );

    let limit = (this.props.limits == null || this.state.itemCount() === 0) ? null : (
      <DropdownButton id='pager-limit-selector' title={String.format('Items per Page ({0})', this.state.limit() || 'All')} onSelect={this.bindCallback(x => x.limit, x => x[1])}>
        {this.props.limits.map((x, i) => (
          <MenuItem key={i} eventKey={x}>{x || 'All'}</MenuItem>
        ))}
      </DropdownButton>
    );

    return (
      <div className='Pager'>
        <div className='Pager-info pull-left'>{info}</div>
        {pager}
        <div className='Pager-limit pull-right'>{limit}</div>
      </div>
    );
  }
}

export default PagerView;
