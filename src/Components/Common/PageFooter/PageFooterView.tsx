import * as React from 'react';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React';
import { PageFooterViewModel, ViewportDimensions } from './PageFooterViewModel';

export interface PageFooterProps extends BaseViewProps {
  copyright?: string | boolean;
  copyrightYear?: number | string;
  copyrightUri?: string;
  footerContent?: any;
  hideDimensions?: boolean;
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
      const { copyright, copyrightYear, copyrightUri, footerContent, hideDimensions } = x;
      return { copyright, copyrightYear, copyrightUri, footerContent, hideDimensions };
    });

    const copyrightContent = this.renderConditional(
      props.copyright !== false,
      () => (
        <span className='PageFooter-text'>
          { `© ${ this.renderCopyrightYear() } `}
          { this.renderCopyrightText() }
        </span>
      ),
    );

    const dimensions = this.renderConditional(
      props.hideDimensions !== true,
      () => (
        <span className='PageFooter-viewport PageFooter-text text-muted'>
          { this.renderDimensions() }
        </span>
      ),
    );

    return (
      <div { ...rest } className={ this.classNames('PageFooter', className) }>
        <Grid>
          <Row>
            <Col md={ 12 }>
              <div className='PageFooter-container'>
                { copyrightContent }
                {
                  this.renderConditional(
                    copyrightContent != null && dimensions != null,
                    () => (<span className='PageFooter-spacer text-muted'> | </span>),
                  )
                }
                { dimensions }
              </div>
            </Col>
          </Row>
          {
            this.renderNullable(
              props.footerContent,
              x => (
                <Row>
                  <Col md={ 12 }>
                    <div className='PageFooter-container'>{ x }</div>
                  </Col>
                </Row>
              ),
            )
          }
        </Grid>
      </div>
    );
  }

  private renderCopyrightYear() {
    return this.renderNullable(
      this.props.copyrightYear,
      x => x,
      () => moment().format('YYYY'),
    );
  }

  private renderCopyrightText() {
    return this.renderNullable(
      this.props.copyrightUri,
      x => (
        <a href={ x }>{ this.props.copyright || '' }</a>
      ),
      () => this.props.copyright || '',
    );
  }

  private renderDimensions() {
    const dim = this.state.viewportDimensions.value;

    return this.renderConditional(
      (dim == null || dim.width === 0 || dim.height === 0),
      () => 'Measuring...',
      () => `Viewport: ${ dim.width }x${ dim.height }`,
    );
  }
}
