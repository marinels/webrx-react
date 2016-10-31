import * as React from 'react';
import { Observable } from 'rx';
import { Grid, Row, Col } from 'react-bootstrap';

import { BaseView, BaseViewProps } from '../../React/BaseView';
import { PageFooterViewModel, ViewportDimensions } from './PageFooterViewModel';

import './PageFooter.less';

export interface PageFooterProps extends BaseViewProps {
}

export class PageFooterView extends BaseView<PageFooterProps, PageFooterViewModel> {
  public static displayName = 'PageFooterView';

  constructor(props?: PageFooterProps, context?: any) {
    super(props, context);

    this.bindObservableToCommand(x => x.viewportDimensionsChanged,
      Observable
        .merge(
          Observable.fromEvent<UIEvent>(window, 'resize'),
          Observable.fromEvent<Event>(window, 'orientationchange'))
        .select(_ => this.getDimensions())
        .startWith(this.getDimensions())
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
