import * as React from 'react';
import * as wx from 'webrx';
import { Grid, Row, Image } from 'react-bootstrap';

import { Loading } from '../Loading/Loading';

import './Splash.less';

export interface SplashProps {
  header: any;
  logo?: string;
  text?: string;
  value?: wx.IObservableProperty<number> | number;
  fluid?: boolean;
}

export class Splash extends React.Component<SplashProps, any> {
  public static displayName = 'SplashView';

  static defaultProps = {
    fluid: false,
    animationPeriod: 0,
  };

  render() {
    return (
      <div className='Splash'>
        <Grid fluid={ this.props.fluid }>
          <Row>
            <div className='Splash-header'>
              { this.props.logo == null ? null : <Image className='pull-left' src={this.props.logo}/> }
              <span className='Splash-headerText'>{this.props.header}</span>
            </div>

            <Loading value={ this.props.value } text={ this.props.text } fontSize='24pt' />
          </Row>
        </Grid>
      </div>
    );
  }
}
