import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { logo } from '../../../Assets';
import { ViewMap, ViewMapper } from '../../../Routing';
import { BaseView, BaseViewProps } from '../../React';
import { AlertHostView } from '../Alert/AlertHostView';
import { PageFooterProps, PageFooterView } from '../PageFooter/PageFooterView';
import { PageHeaderProps, PageHeaderView } from '../PageHeader/PageHeaderView';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { SplashKey } from '../RouteHandler/RouteHandlerViewModel';
import { Splash } from '../Splash/Splash';
import { AppViewModel } from './AppViewModel';
import { BootstrapGuide } from './BootstrapGuide';
import { updateDefaultContainer } from './NamespacedPortal';

ViewMap[SplashKey] = () => (
  <Splash header='webrx-react' logo={ logo } />
);

export interface AppProps extends PageHeaderProps, PageFooterProps {
  viewMap?: ViewMapper;
  guide?: boolean;
  alerts?: boolean;
  header?: boolean;
  footer?: boolean;
}

export interface AppViewProps extends BaseViewProps<AppViewModel>, AppProps {
}

export class AppView extends BaseView<AppViewProps, AppViewModel> {
  public static displayName = 'AppView';

  public static updateDefaultPortalContainer = updateDefaultContainer;

  static defaultProps: Partial<AppProps> = {
    viewMap: ViewMap,
    guide: DEBUG,
  };

  updateOn(viewModel: Readonly<AppViewModel>) {
    return [
      viewModel.isLoading.changed,
    ];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {
        viewMap, guide, brand, branduri, responsive, alerts, header, footer, copyright, copyrightYear, copyrightUri,
        footerContent, hideDimensions,
      } = x;
      return {
        viewMap, guide, brand, branduri, responsive, alerts, header, footer, copyright, copyrightYear, copyrightUri,
        footerContent, hideDimensions,
      };
    });

    const footerProps = {
      copyright: props.copyright,
      copyrightYear: props.copyrightYear,
      copyrightUri: props.copyrightUri,
      footerContent: props.footerContent,
      hideDimensions: props.hideDimensions,
    };

    return (
      <div className='webrx-react bootstrap-3' ref={ updateDefaultContainer }>
        <div { ...rest } className={ this.wxr.classNames('App', className) }>
          {
            this.wxr.renderConditional(this.viewModel.isLoading, () => (
              <i className='preload fa fa-spinner fa-5x fa-pulse' aria-hidden='true'></i>
            ), () => (
              <div>
                { this.wxr.renderConditional(props.guide, () => (<BootstrapGuide />)) }
                {
                  this.wxr.renderConditional(props.alerts, () => (
                    <div className='float-container'>
                      <Grid>
                        <AlertHostView viewModel={ this.viewModel.alerts } />
                      </Grid>
                    </div>
                  ))
                }
                {
                  this.wxr
                    .renderConditional(
                      props.header,
                      () => (
                        <PageHeaderView
                          viewModel={ this.viewModel.header }
                          brand={ props.brand }
                          branduri={ props.branduri }
                          responsive={ props.responsive }
                        />
                      ),
                    )
                }
                <RouteHandlerView viewModel={ this.viewModel.routeHandler } viewMap={ props.viewMap! } />
                {
                  this.wxr
                    .renderConditional(
                      props.footer,
                      () => (
                        <PageFooterView viewModel={ this.viewModel.footer } { ...footerProps } />
                      ),
                    )
                }
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
