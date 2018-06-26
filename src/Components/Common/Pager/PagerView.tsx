import * as React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import {
  DropdownButton,
  DropdownButtonProps,
  MenuItem,
  Pagination,
  PaginationProps,
} from 'react-bootstrap';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { PagerViewModel, StandardLimits } from './PagerViewModel';

// clone of react-bootstrap PaginationProps, but without the subclassing
export type BootstrapPaginationProps = Omit<
  PaginationProps,
  React.HTMLProps<Pagination>
>;

export interface PagerProps extends BootstrapPaginationProps {
  info?: boolean;
  limits?: number[];
  dropdownProps?: DropdownButtonProps;
  order?: PagerComponentTypes[];
  emptyInfo?: string;
}

export interface PagerViewProps
  extends BaseViewProps<PagerViewModel>,
    PagerProps {}

export type PagerComponentTypes = 'info' | 'controls' | 'limit' | undefined;
export const StandardPagerComponentOrder: PagerComponentTypes[] = [
  'info',
  'controls',
  'limit',
];

export class PagerView extends BaseView<PagerViewProps, PagerViewModel> {
  public static displayName = 'PagerView';

  static defaultProps: Partial<PagerProps> = {
    first: true,
    prev: true,
    next: true,
    last: true,
    boundaryLinks: true,
    maxButtons: 3,
    info: true,
    limits: StandardLimits,
    order: StandardPagerComponentOrder,
    emptyInfo: 'No Items to Display',
  };

  private readonly renderFunctions: {
    [type: string]: (() => {} | null | undefined);
  } = {
    info: this.renderInfo.bind(this),
    controls: this.renderControls.bind(this),
    limit: this.renderLimit.bind(this),
  };

  updateOn(viewModel: Readonly<PagerViewModel>) {
    return [
      viewModel.itemCount.changed,
      viewModel.limit.changed,
      viewModel.offset.changed,
      viewModel.pageCount.changed,
      viewModel.selectedPage.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { info, limits, dropdownProps, order, emptyInfo } = x;
      return { info, limits, dropdownProps, order, emptyInfo };
    });

    const pagerProps = Object.rest(rest, x => {
      const {
        activePage,
        boundaryLinks,
        bsSize,
        bsStyle,
        buttonComponentClass,
        ellipsis,
        first,
        items,
        last,
        maxButtons,
        next,
        onSelect,
        prev,
      } = x;
      return {
        activePage,
        boundaryLinks,
        bsSize,
        bsStyle,
        buttonComponentClass,
        ellipsis,
        first,
        items,
        last,
        maxButtons,
        next,
        onSelect,
        prev,
      };
    });

    return this.wxr.renderConditional(this.shouldRenderPager(), () => (
      <div
        {...pagerProps.rest}
        className={this.wxr.classNames('Pager', className)}
      >
        <Grid fluid>{this.renderComponents()}</Grid>
      </div>
    ));
  }

  protected isEmpty() {
    return (this.viewModel.itemCount.value || 0) === 0;
  }

  protected renderComponents() {
    if (this.shouldRenderEmpty()) {
      return this.renderEmpty();
    }

    const types = this.props.order || [];
    const components = types.map(x => this.renderComponent(x));

    if (components.length === 1) {
      return (
        <Row>
          <Col className="Pager-col Pager-col-center">{components[0]}</Col>
        </Row>
      );
    }

    if (components.length === 2) {
      return (
        <Row>
          <Col className="Pager-col Pager-col-left" md={6}>
            {components[0]}
          </Col>
          <Col className="Pager-col Pager-col-right" md={6}>
            {components[1]}
          </Col>
        </Row>
      );
    }

    return (
      <Row>
        <Col className="Pager-col Pager-col-left" md={4}>
          {components[0]}
        </Col>
        <Col className="Pager-col Pager-col-center" md={4}>
          {components[1]}
        </Col>
        <Col className="Pager-col Pager-col-right" md={4}>
          {components[2]}
        </Col>
      </Row>
    );
  }

  private shouldRenderPager() {
    return (
      (this.props.order || []).length > 0 &&
      (this.shouldRenderEmpty() ||
        this.shouldRenderInfo() ||
        this.shouldRenderControls() ||
        this.shouldRenderLimit())
    );
  }

  private shouldRenderEmpty() {
    return (
      this.isEmpty() && String.isNullOrEmpty(this.props.emptyInfo) === false
    );
  }

  private shouldRenderInfo() {
    return this.props.info === true && (this.viewModel.limit.value || 0) > 0;
  }

  private shouldRenderControls() {
    return (this.viewModel.pageCount.value || 1) > 1;
  }

  private shouldRenderLimit() {
    return (
      (this.props.limits || []).length > 1 &&
      (this.viewModel.itemCount.value || 0) > 0
    );
  }

  private renderComponent(type: PagerComponentTypes | undefined) {
    return type && this.renderFunctions[type]();
  }

  private renderEmpty() {
    return (
      <Row>
        <Col className="Pager-col">
          <div className="Pager-empty">{this.props.emptyInfo}</div>
        </Col>
      </Row>
    );
  }

  private renderInfo() {
    return this.wxr.renderConditional(
      this.shouldRenderInfo(),
      () => {
        const start = this.viewModel.offset.value + 1;
        const end = Math.min(
          this.viewModel.itemCount.value,
          this.viewModel.offset.value + (this.viewModel.limit.value || 0),
        );
        const total = this.viewModel.itemCount.value;
        return (
          <div className="Pager-info">{`Showing Items ${start} through ${end} of ${total}`}</div>
        );
      },
      () => '',
    );
  }

  private renderControls() {
    const { props } = this.restProps(x => {
      const {
        activePage,
        bsSize,
        bsStyle,
        buttonComponentClass,
        ellipsis,
        first,
        items,
        last,
        maxButtons,
        next,
        prev,
      } = x;
      return {
        activePage,
        bsSize,
        bsStyle,
        buttonComponentClass,
        ellipsis,
        first,
        items,
        last,
        maxButtons,
        next,
        prev,
      };
    });

    return this.wxr.renderConditional(
      this.shouldRenderControls(),
      () => (
        <Pagination
          items={this.viewModel.pageCount.value}
          activePage={this.viewModel.selectedPage.value}
          onSelect={this.bindEventToCommand(x => x.selectPage)}
          {...Object.assign(props, {
            items: this.viewModel.pageCount.value,
            activePage: this.viewModel.selectedPage.value,
          })}
        />
      ),
      () => '',
    );
  }

  private renderLimit() {
    return this.wxr.renderConditional(
      this.shouldRenderLimit(),
      () => (
        <DropdownButton
          id={this.props.id || 'pager-limit-selector'}
          {...this.props.dropdownProps}
          title={this.renderLimitTitle()}
          onSelect={this.bindEventToProperty(x => x.limit)}
        >
          {this.props.limits!.map((x, i) => (
            <MenuItem
              key={i}
              eventKey={x}
              selected={this.viewModel.limit.value === x}
            >
              {x || 'All'}
            </MenuItem>
          ))}
        </DropdownButton>
      ),
      () => '',
    );
  }

  private renderLimitTitle() {
    return `Items per Page (${this.viewModel.limit.value || 'All'})`;
  }
}
