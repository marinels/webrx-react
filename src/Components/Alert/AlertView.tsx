'use strict';

import * as Rx from 'rx';

import * as React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import { Fade, Alert } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../React/BaseView';

import AlertViewModel from './AlertViewModel';

import './Alert.less';

interface IAlertProps extends IBaseViewProps {
  key: any;
}

export class AlertView extends BaseView<IAlertProps, AlertViewModel> {
	render() {
		return (
			<div className='Alert'>
        <Grid>
          <Row>
            <Col md={12}>
              <Fade in={this.state.isVisible()} transitionAppear={true} onDismiss={this.bindEvent(x => x.dismiss)}>
                <Alert bsStyle={this.state.style}>
                  <h4>{this.state.header}</h4>
                  {this.state.text}
                </Alert>
              </Fade>
            </Col>
          </Row>
        </Grid>
			</div>
		);
	}
}

export default AlertView;
