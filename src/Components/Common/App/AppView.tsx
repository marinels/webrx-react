import * as React from 'react';
import { Observable } from 'rxjs';
import { Grid } from 'react-bootstrap';

import { updateDefaultContainer } from './NamespacedPortal';
import { BootstrapGuide } from './BootstrapGuide';
import { wxr, BaseView, BaseViewProps } from '../../React';
import { Splash } from '../Splash/Splash';
import { AlertHostView } from '../Alert/AlertHostView';
import { SplashKey } from '../RouteHandler/RouteHandlerViewModel';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { PageHeaderView, PageHeaderProps } from '../PageHeader/PageHeaderView';
import { PageFooterView, PageFooterProps } from '../PageFooter/PageFooterView';
import { AppViewModel } from './AppViewModel';
import { ViewMap, ViewMapper } from '../../../Routing/ViewMap';

ViewMap[SplashKey] = () => (
  <Splash header='webrx-react' />
);

export interface AppProps extends PageHeaderProps, PageFooterProps {
  viewMap?: ViewMapper;
  guide?: boolean;
  alerts?: boolean;
  header?: boolean;
  footer?: boolean;
}

export interface AppViewProps extends BaseViewProps<AppViewModel, AppView>, AppProps {
}

export class AppView extends BaseView<AppViewProps, AppViewModel> {
  public static displayName = 'AppView';

  public static updateDefaultPortalContainer = updateDefaultContainer;

  static defaultProps = {
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
      const { viewMap, guide, brand, branduri, alerts, header, footer, copyright, copyrightYear, copyrightUri, footerContent, hideDimensions } = x;
      return { viewMap, guide, brand, branduri, alerts, header, footer, copyright, copyrightYear, copyrightUri, footerContent, hideDimensions };
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
        <div { ...rest } className={ wxr.classNames('App', className) }>
          {
            this.renderConditional(this.viewModel.isLoading, () => (
              <i className='preload fa fa-spinner fa-5x fa-pulse' aria-hidden='true'></i>
            ), () => (
              <div>
                { this.renderConditional(props.guide, () => (<BootstrapGuide />)) }
                {
                  this.renderConditional(props.alerts, () => (
                    <div className='float-container'>
                      <Grid>
                        <AlertHostView viewModel={ this.viewModel.alerts } />
                      </Grid>
                    </div>
                  ))
                }
                { this.renderConditional(props.header, () => (<PageHeaderView viewModel={ this.viewModel.header } brand={ props.brand } branduri={ props.branduri } />)) }
                <RouteHandlerView viewModel={ this.viewModel.routeHandler } viewMap={ props.viewMap! } />
                { this.renderConditional(props.footer, () => (<PageFooterView viewModel={ this.viewModel.footer } { ...footerProps } />)) }
              </div>
            ))
          }
        </div>
      </div>
    );
  }
}
