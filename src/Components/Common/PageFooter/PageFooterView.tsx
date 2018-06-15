import * as moment from 'moment';
import * as React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { BaseView, BaseViewProps } from '../../React';
import { PageFooterViewModel, ViewportDimensions } from './PageFooterViewModel';

export interface PageFooterProps {
  copyright?: string | boolean;
  copyrightYear?: number | string;
  copyrightUri?: string;
  footerContent?: any;
  hideDimensions?: boolean;
}

export interface PageFooterViewProps extends BaseViewProps<PageFooterViewModel>, PageFooterProps {
}

export class PageFooterView extends BaseView<PageFooterViewProps, PageFooterViewModel> {
  public static displayName = 'PageFooterView';

  static defaultProps: Partial<PageFooterProps> = {
  };

  constructor(props: any) {
    super(props);

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

  updateOn(viewModel: Readonly<PageFooterViewModel>) {
    return [
      viewModel.viewportDimensions.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { copyright, copyrightYear, copyrightUri, footerContent, hideDimensions } = x;
      return { copyright, copyrightYear, copyrightUri, footerContent, hideDimensions };
    });

    const copyrightContent = this.wxr.renderConditional(
      props.copyright !== false,
      () => (
        <span className='PageFooter-text'>
          { `© ${ this.renderCopyrightYear() } `}
          { this.renderCopyrightText() }
        </span>
      ),
    );

    const dimensions = this.wxr.renderConditional(
      props.hideDimensions !== true,
      () => (
        <span className='PageFooter-viewport PageFooter-text text-muted'>
          { this.renderDimensions() }
        </span>
      ),
    );

    return (
      <div { ...rest } className={ this.wxr.classNames('PageFooter', className) }>
        <Grid>
          <Row>
            <Col md={ 12 }>
              <div className='PageFooter-container'>
                { copyrightContent }
                {
                  this.wxr.renderConditional(
                    copyrightContent != null && dimensions != null,
                    () => (<span className='PageFooter-spacer text-muted'> | </span>),
                  )
                }
                { dimensions }
              </div>
            </Col>
          </Row>
          {
            this.wxr.renderNullable(
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
    return this.wxr.renderNullable(
      this.props.copyrightYear,
      x => x,
      () => moment().format('YYYY'),
    );
  }

  private renderCopyrightText() {
    return this.wxr.renderNullable(
      this.props.copyrightUri,
      x => (
        <a href={ x }>{ this.props.copyright || '' }</a>
      ),
      () => this.props.copyright || '',
    );
  }

  private renderDimensions() {
    const dim = this.viewModel.viewportDimensions.value;

    return this.wxr.renderConditional(
      (dim == null || dim.width === 0 || dim.height === 0),
      () => 'Measuring...',
      () => `Viewport: ${ dim.width }x${ dim.height }`,
    );
  }
}
