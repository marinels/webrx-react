import * as React from 'react';
import { Observable } from 'rx';
import { Pagination, PaginationProps, DropdownButton, MenuItem } from 'react-bootstrap';

import { BaseView, ViewModelProps } from '../../React';
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

const ComponentLocations = [ 'left', 'center', 'right' ];

export class PagerView extends BaseView<PagerViewProps, PagerViewModel> {
  public static displayName = 'PagerView';

  static defaultProps = {
    first: true,
    prev: true,
    next: true,
    last: true,
    boundaryLinks: true,
    maxButtons: 5,
    info: true,
    limits: StandardLimits,
    order: StandardPagerComponentOrder,
    emptyInfo: 'No Items to Display',
  };

  private readonly renderFunctions: { [ type: string ]: Function } = {
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
      const { activePage, boundaryLinks, bsSize, bsStyle, bsClass, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, onSelect, prev } = x;
      return { activePage, boundaryLinks, bsSize, bsStyle, bsClass, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, onSelect, prev };
    });

    return (
      <div { ...pagerProps.rest } className={ this.classNames('Pager', className) }>
        {
          this.renderConditional(this.shouldRenderPager(), () => {
            const types = props.order || [];

            return ComponentLocations
              .map((location, i) => ({ location, type: types[i] }))
              .map(x => this.renderComponent(x.location, x.type));
          })
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
    return this.props.info === true && (this.state.limit.value || 0) > 0;
  }

  private shouldRenderControls() {
    return (this.state.pageCount.value || 1) > 1;
  }

  private shouldRenderLimit() {
    return (this.props.limits || []).length > 1 && (this.state.itemCount.value || 0) > 0;
  }

  private renderComponent(location: string, type: PagerComponentTypes) {
    const className = type == null ? null : `Pager-${ type }`;

    return (
      <div key={ location } className={ this.classNames(className, `Pager-${ location }`) }>
        { this.renderConditional(type != null, () => this.renderFunctions[type].apply(this)) }
      </div>
    );
  }

  private renderInfo() {
    return this.renderConditional(this.shouldRenderInfo(), () => (
      this.renderConditional((this.state.itemCount.value || 0) === 0,
        () => this.props.emptyInfo,
        () => `Showing Items ${ this.state.offset.value + 1 } through ${ Math.min(this.state.itemCount.value, this.state.offset.value + (this.state.limit.value || 0)) } of ${ this.state.itemCount.value }`,
      )
    ), () => '');
  }

  private renderControls() {
    const { props } = this.restProps(x => {
      const { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev } = x;
      return { activePage, bsSize, bsStyle, buttonComponentClass, ellipsis, first, items, last, maxButtons, next, prev };
    });

    return this.renderConditional(this.shouldRenderControls(), () => (
      <Pagination items={ this.state.pageCount.value } activePage={ this.state.selectedPage.value } onSelect={ this.bindEventToCommand(x => x.selectPage) }
        { ...(Object.assign(props, { items: this.state.pageCount.value, activePage: this.state.selectedPage.value })) }
      />
    ), () => '');
  }

  private renderLimit() {
    return this.renderConditional(this.shouldRenderLimit(), () => (
      <DropdownButton id={ this.props.id || 'pager-limit-selector' } title={ this.renderLimitTitle() } onSelect={ this.bindEventToProperty(x => x.limit) }>
        {
          this.props.limits!
            .map((x, i) => (
              <MenuItem key={ i } eventKey={ x } selected={ this.state.limit.value === x }>{x || 'All'}</MenuItem>
            ))
        }
      </DropdownButton>
    ), () => '');
  }

  private renderLimitTitle() {
    return `Items per Page (${ this.state.limit.value || 'All' })`;
  }
}
