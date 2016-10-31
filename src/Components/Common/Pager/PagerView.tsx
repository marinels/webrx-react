import * as React from 'react';
import * as classNames from 'classnames';
import { Pagination, PaginationProps, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { PagerViewModel, StandardLimits } from './PagerViewModel';

import './Pager.less';

export interface PagerProps extends BaseViewProps, PaginationProps {
  info?: boolean;
  limits?: number[];
}

export class PagerView extends BaseView<PagerProps, PagerViewModel> {
  public static displayName = 'PagerView';

  static defaultProps = {
    first: true,
    prev: true,
    next: true,
    last: true,
    info: true,
    limits: StandardLimits,
  };

  updateOn() {
    return [
      this.state.pageCount.changed,
      this.state.selectedPage.changed,
    ];
  }

  render() {
    const { rest, props } = this.restProps(x => {
      const { info, limits, className } = x;
      return { info, limits, className };
    });

    const pagerProps = Object.rest(rest, x => {
      const { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev } = x;
      return { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev };
    });

    return (
      <div { ...pagerProps.rest } className={ classNames('Pager', props.className) }>
        { this.renderInfo(props.info) }
        { this.renderControls(props.limits, pagerProps.props) }
        { this.renderLimit(props.limits, rest) }
      </div>
    );
  }

  private renderInfo(info: boolean) {
    return this.renderConditional(info === true, () => (
      <div className='Pager-info'>
        {
          this.renderConditional((this.state.itemCount() || 0) === 0,
            'No Items to Display',
            `Showing Items ${ this.state.offset() + 1 } through ${ Math.min(this.state.itemCount(), this.state.offset() + this.state.limit()) } of ${ this.state.itemCount() }`
          )
        }
      </div>
    ));
  }

  private renderControls(limits: number[], props: PaginationProps) {
    return this.renderConditional(this.state.pageCount() > 1 && this.state.selectedPage() != null, () => (
      <div className='Pager-controls'>
        <Pagination items={ this.state.pageCount() } activePage={ this.state.selectedPage() } onSelect={ this.bindEventToCommand(x => x.selectPage) }
          { ...(Object.assign(props, { items: this.state.pageCount(), activePage: this.state.selectedPage() })) }
        />
      </div>
    ));
  }

  private renderLimit(limits: number[], rest: any) {
    return this.renderConditional(limits != null && limits.length > 0 && this.state.itemCount() > 0, () => (
      <div className='Pager-limit'>
        <DropdownButton id={ rest.id || 'pager-limit-selector' } title={ this.renderLimitTitle() } onSelect={ this.bindEventToProperty(x => x.limit) }>
          {
            limits
              .map((x, i) => (
                <MenuItem key={ i } eventKey={ x } selected={ this.state.limit() === x }>{x || 'All'}</MenuItem>
              ))
          }
        </DropdownButton>
      </div>
    ));
  }

  private renderLimitTitle() {
    return `Items per Page (${ this.state.limit() || 'All' })`;
  }
}
