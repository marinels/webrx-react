import * as React from 'react';
import * as classNames from 'classnames';
import { Pagination, PaginationProps, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, ViewModelProps } from '../../React/BaseView';
import { PagerViewModel, StandardLimits } from './PagerViewModel';

import './Pager.less';

export interface PagerProps extends PaginationProps {
  info?: boolean;
  limits?: number[];
  order?: PagerComponentTypes[];
  emptyInfo?: string;
}

export interface PagerViewProps extends PagerProps, ViewModelProps {
}

export type PagerComponentTypes = 'info' | 'controls' | 'limit';
export const StandardPagerComponentOrder: PagerComponentTypes[] = [ 'info', 'controls', 'limit' ];

export class PagerView extends BaseView<PagerViewProps, PagerViewModel> {
  public static displayName = 'PagerView';

  static defaultProps = {
    first: true,
    prev: true,
    next: true,
    last: true,
    ellipsis: true,
    info: true,
    limits: StandardLimits,
    order: StandardPagerComponentOrder,
    emptyInfo: 'No Items to Display',
  };

  private renderFunctions: { [ type: string ]: Function } = {
    info: this.renderInfo,
    controls: this.renderControls,
    limit: this.renderLimit,
  };

  updateOn() {
    return [
      this.state.itemCount.changed,
      this.state.limit.changed,
      this.state.offset.changed,
      this.state.pageCount.changed,
      this.state.selectedPage.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { info, limits, order, emptyInfo } = x;
      return { info, limits, order, emptyInfo };
    });

    const pagerProps = Object.rest(rest, x => {
      const { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev } = x;
      return { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev };
    });

    return (
      <div { ...pagerProps.rest } className={ classNames('Pager', className) }>
        {
          this.renderConditional(this.shouldRenderPager(), () =>
            (props.order || []).map(x => this.renderComponent(x))
          )
        }
      </div>
    );
  }

  private shouldRenderPager() {
    return (
      this.shouldRenderInfo() ||
      this.shouldRenderControls() ||
      this.shouldRenderLimit()
    ) && (this.props.order || []).length > 0;
  }

  private shouldRenderInfo() {
    return this.props.info === true && (this.state.limit() || 0) > 0;
  }

  private shouldRenderControls() {
    return (this.state.pageCount() || 1) > 1;
  }

  private shouldRenderLimit() {
    return (this.props.limits || []).length > 0 && (this.state.itemCount() || 0) > 0;
  }

  private renderComponent(type: PagerComponentTypes) {
    return (
      <div key={ type } className={ `Pager-${ type }`}>{ this.renderFunctions[type].apply(this) }</div>
    );
  }

  private renderInfo() {
    return this.renderConditional(this.shouldRenderInfo(), () => (
      this.renderConditional((this.state.itemCount() || 0) === 0,
        this.props.emptyInfo,
        `Showing Items ${ this.state.offset() + 1 } through ${ Math.min(this.state.itemCount(), this.state.offset() + this.state.limit()) } of ${ this.state.itemCount() }`
      )
    ), () => '');
  }

  private renderControls() {
    const { props } = this.restProps(x => {
      const { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev } = x;
      return { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev };
    });

    return this.renderConditional(this.shouldRenderControls(), () => (
      <Pagination items={ this.state.pageCount() } activePage={ this.state.selectedPage() } onSelect={ this.bindEventToCommand(x => x.selectPage) }
        { ...(Object.assign(props, { items: this.state.pageCount(), activePage: this.state.selectedPage() })) }
      />
    ), () => '');
  }

  private renderLimit() {
    return this.renderConditional(this.shouldRenderLimit(), () => (
      <DropdownButton id={ this.props.id || 'pager-limit-selector' } title={ this.renderLimitTitle() } onSelect={ this.bindEventToProperty(x => x.limit) }>
        {
          this.props.limits
            .map((x, i) => (
              <MenuItem key={ i } eventKey={ x } selected={ this.state.limit() === x }>{x || 'All'}</MenuItem>
            ))
        }
      </DropdownButton>
    ), () => '');
  }

  private renderLimitTitle() {
    return `Items per Page (${ this.state.limit() || 'All' })`;
  }
}
