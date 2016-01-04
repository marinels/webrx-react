'use strict';

import * as React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { ProgressBar } from 'react-bootstrap';

import SplashViewModel from './SplashViewModel';

import { BaseView, IBaseViewProps } from '../../React/BaseView';

import './Splash.less';

interface ISplashProps extends IBaseViewProps {
  active?: boolean;
  striped?: boolean;
}

export class SplashView extends BaseView<ISplashProps, SplashViewModel> {
  public static displayName = 'SplashView';

  static defaultProps = {
    active: true,
    striped: true
  };

  updateOn() {
    return [
      this.state.text.changed,
      this.state.value.changed
    ];
  }

  render() {
    let text = (
      <div className='Splash-text'>
        {this.state.text()}
      </div>
    );

    return (
      <div className='Splash'>
        <Grid>
          <Row>
            <Col md={12}>
              <ProgressBar bsSize='large' label={text} now={this.state.value()} {...this.props} />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default SplashView;
