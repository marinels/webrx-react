import * as React from 'react';
import { Grid, Row, Image } from 'react-bootstrap';

import { Loading } from '../Loading/Loading';

import './Splash.less';

interface ISplashProps {
  header: any;
  logo?: string;
  text?: string;
  indeterminate?: boolean;
  fluid?: boolean;
}

export class Splash extends React.Component<ISplashProps, any> {
  public static displayName = 'SplashView';

  static defaultProps = {
    fluid: false,
    animationPeriod: 0,
  };

  render() {
    return (
      <div className='Splash'>
        <Grid fluid={this.props.fluid}>
          <Row>
            <div className='Splash-header'>
              { this.props.logo == null ? null : <Image className='pull-left' src={this.props.logo}/> }
              <span className='Splash-headerText'>{this.props.header}</span>
            </div>

            <Loading fluid indeterminate={this.props.indeterminate} text={this.props.text} />
          </Row>
        </Grid>
      </div>
    );
  }
}
