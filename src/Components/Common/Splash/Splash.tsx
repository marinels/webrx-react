'use strict';

import * as React from 'react';
import { Grid, Image } from 'react-bootstrap';

import { Loading } from '../Loading/Loading';

import './Splash.less';

interface ISplashProps {
  text: string;
  logo?: string;
  loadingText?: string;
  animationPeriod?: number;
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
          <div className='Splash-header'>
            { this.props.logo == null ? null : <Image src={this.props.logo}/> }
            <span className='Splash-headerText'>{this.props.text}</span>
          </div>

          <Loading animationPeriod={this.props.animationPeriod} text={String.isNullOrEmpty(this.props.loadingText) ? undefined : this.props.loadingText} />
        </Grid>
      </div>
    );
  }
}

export default Splash;
