import * as React from 'react';
import * as classNames from 'classnames';
import * as moment from 'moment';
import { Observable } from 'rx';
import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { PageFooterViewModel, ViewportDimensions } from './PageFooterViewModel';

import './PageFooter.less';

export interface PageFooterProps extends BaseViewProps {
  copyright?: string;
}

export class PageFooterView extends BaseView<PageFooterProps, PageFooterViewModel> {
  public static displayName = 'PageFooterView';

  static defaultProps = {
  };

  constructor(props?: PageFooterProps, context?: any) {
    super(props, context);

    this.bindObservableToCommand(
      Observable
        .merge(
          Observable.fromEvent<UIEvent>(window, 'resize'),
          Observable.fromEvent<Event>(window, 'orientationchange'),
        )
        .startWith(undefined as any)
        .map(() => this.getDimensions()),
      x => x.viewportDimensionsChanged,
    );
  }

  private getDimensions(): ViewportDimensions {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  updateOn() {
    return [
      this.state.viewportDimensions.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { copyright } = x;
      return { copyright };
    });

    return (
      <div { ...rest } className={ classNames('PageFooter', className) }>
        <Grid>
          <Row>
            <Col md={12}>
              <div className='PageFooter-container'>
                <span className='PageFooter-text'>
                  { `© ${ moment().format('YYYY') }${ String.isNullOrEmpty(props.copyright) ? '' : ` ${ props.copyright }` }` }
                </span>
                <span className='PageFooter-spacer'> | </span>
                <span ref='viewport' className='PageFooter-viewport PageFooter-text text-muted'>
                  { this.renderDimensions() }
                </span>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

  private renderDimensions() {
    const dim = this.state.viewportDimensions();

    return this.renderConditional(
      (dim == null || dim.width === 0 || dim.height === 0),
      () => 'Measuring...',
      () => `Viewport: ${ dim.width }x${ dim.height }`,
    );
  }
}
