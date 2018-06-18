import * as React from 'react';
import { Grid, Image, Row } from 'react-bootstrap';

import { Property } from '../../../WebRx';
import { Loading } from '../Loading/Loading';

export interface SplashProps {
  header: any;
  logo?: string;
  text?: string;
  progress?: Property<number> | number;
  fluid?: boolean;
}

export interface SplashComponentProps extends React.HTMLProps<any>, SplashProps {
}

export class Splash extends React.Component<SplashComponentProps> {
  public static displayName = 'Splash';

  static defaultProps: Partial<SplashProps> = {
    fluid: false,
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { header, logo, text, progress, fluid } = x;
      return { header, logo, text, progress, fluid };
    });

    return (
      <div { ...rest } className={ this.wxr.classNames('Splash', className) }>
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
    return this.wxr.renderConditional(this.props.logo != null, () => (
      <Image className='Splash-logo' src={ this.props.logo } rounded />
    ));
  }
}
