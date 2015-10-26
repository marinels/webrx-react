'use strict';

import * as React from 'react';

import { Pagination, PaginationProps } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import PagerViewModel from './PagerViewModel';

import './Pager.less';

interface IPagerProps extends IBaseViewProps, PaginationProps {
}

export class PagerView extends BaseView<IPagerProps, PagerViewModel> {
  updateOn() {
    return [
      this.state.pageCount.changed,
      this.state.selectedPage.changed
    ]
  }

  render() {
    let pager = this.state.pageCount() == null ? null : (
      <Pagination items={this.state.pageCount()} activePage={this.state.selectedPage()} onSelect={this.bindCallback(x => x.selectedPage, x => x[1].eventKey)} {...this.props} />
    );

    return (
      <div className='Pager'>
        {pager}
      </div>
    );
  }
}

export default PagerView;
