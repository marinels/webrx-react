'use strict';

import * as React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { PageFooterViewModel, IViewportDimension } from './PageFooterViewModel';

import './PageFooter.less';

interface IPageFooterProps extends IBaseViewProps {
}

export class PageFooterView extends BaseView<IPageFooterProps, PageFooterViewModel> {
  public static displayName = 'PageFooterView';

  private getDimensions(): IViewportDimension {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  updateOn() {
    return [
      this.state.viewportDimensions.changed
    ];
  }

  initialize() {
    super.initialize();

    this.bindObservable(x => x.viewportDimensionsChanged,
      Rx.Observable
        .merge(
          Rx.Observable.fromEvent<UIEvent>(window, 'resize'),
          Rx.Observable.fromEvent<Event>(window, 'orientationchange'))
        .select(_ => this.getDimensions())
        .startWith(this.getDimensions())
    );
  }

  render() {
    return (
      <div className='PageFooter'>
        <Grid>
          <Row>
            <Col md={12}>
              <div className='PageFooter-container'>
                <span className='PageFooter-text'>© {this.state.copyright}</span>
                <span className='PageFooter-spacer'> | </span>
                <span ref='viewport' className='PageFooter-viewport PageFooter-text text-muted'>Viewport: {this.state.viewportDimensions()}</span>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default PageFooterView;
