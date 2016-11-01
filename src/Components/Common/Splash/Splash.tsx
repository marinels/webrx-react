import * as React from 'react';
import * as wx from 'webrx';
import { Grid, Row, Image } from 'react-bootstrap';
import * as classNames from 'classnames';

import { Loading } from '../Loading/Loading';
import { renderConditional } from '../../React/RenderHelpers';

import './Splash.less';

export interface SplashProps extends React.HTMLAttributes {
  header: any;
  logo?: string;
  text?: string;
  progress?: wx.IObservableProperty<number> | number;
  fluid?: boolean;
}

export class Splash extends React.Component<SplashProps, any> {
  public static displayName = 'SplashView';

  static defaultProps = {
    fluid: false,
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { header, logo, text, progress, fluid } = x;
      return { header, logo, text, progress, fluid };
    });

    return (
      <div { ...rest } className={ classNames('Splash', className) }>
        <Grid fluid={ props.fluid }>
          <Row>
            <div className='Splash-header'>
              { this.renderLogo() }
              <span className='Splash-headerText'>{ props.header }</span>
            </div>

            <Loading progress={ props.progress } text={ props.text } fontSize='24pt' />
          </Row>
        </Grid>
      </div>
    );
  }

  private renderLogo() {
    return renderConditional(this.props.logo != null, () => (
      <Image className='pull-left' src={this.props.logo}/>
    ));
  }
}
