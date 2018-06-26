import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { Observable } from 'rxjs';

import { logo } from '../../../Assets';
import { ViewMap, ViewMapper } from '../../../Routing';
import { BaseView, BaseViewProps } from '../../React';
import { AlertHostView } from '../Alert/AlertHostView';
import { AlertHostViewModel } from '../Alert/AlertHostViewModel';
import { PageFooterProps, PageFooterView } from '../PageFooter/PageFooterView';
import { PageFooterViewModel } from '../PageFooter/PageFooterViewModel';
import { PageHeaderProps, PageHeaderView } from '../PageHeader/PageHeaderView';
import { PageHeaderViewModel } from '../PageHeader/PageHeaderViewModel';
import { RouteHandlerView } from '../RouteHandler/RouteHandlerView';
import { RouteHandlerViewModel } from '../RouteHandler/RouteHandlerViewModel';
import { SplashKey } from '../RouteHandler/RouteHandlerViewModel';
import { Splash } from '../Splash/Splash';
import { AppViewModel } from './AppViewModel';
import { BootstrapGuide } from './BootstrapGuide';
import { updateDefaultContainer } from './NamespacedPortal';

ViewMap[SplashKey] = () => <Splash header="webrx-react" logo={logo} />;

export interface AppProps extends PageHeaderProps, PageFooterProps {
  viewMap?: ViewMapper;
  guide?: boolean | (() => BootstrapGuide);
  alerts?:
    | boolean
    | ((viewModel: AlertHostViewModel, props: AppProps) => AlertHostView);
  header?:
    | boolean
    | ((viewModel: PageHeaderViewModel, props: AppProps) => PageHeaderView);
  footer?:
    | boolean
    | ((viewModel: PageFooterViewModel, props: AppProps) => PageFooterView);
  routeHandler?: (
    viewModel: RouteHandlerViewModel,
    props: AppProps,
  ) => RouteHandlerView;
}

export interface AppViewProps extends BaseViewProps<AppViewModel>, AppProps {}

export class AppView extends BaseView<AppViewProps, AppViewModel> {
  public static displayName = 'AppView';

  public static updateDefaultPortalContainer = updateDefaultContainer;

  static defaultProps: Partial<AppProps> = {
    viewMap: ViewMap,
    guide: DEBUG,
  };

  updateOn(viewModel: Readonly<AppViewModel>) {
    return [viewModel.isLoading.changed];
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const {
        viewMap,
        guide,
        brand,
        branduri,
        responsive,
        alerts,
        header,
        footer,
        copyright,
        copyrightYear,
        copyrightUri,
        footerContent,
        hideDimensions,
      } = x;
      return {
        viewMap,
        guide,
        brand,
        branduri,
        responsive,
        alerts,
        header,
        footer,
        copyright,
        copyrightYear,
        copyrightUri,
        footerContent,
        hideDimensions,
      };
    });

    return (
      <div className="webrx-react bootstrap-3" ref={updateDefaultContainer}>
        <div
          {...rest}
          className={this.wxr.classNames(
            'App',
            { responsive: props.responsive },
            className,
          )}
        >
          {this.wxr.renderConditional(
            this.viewModel.isLoading,
            () => (
              <i
                className="preload fa fa-spinner fa-5x fa-pulse"
                aria-hidden="true"
              />
            ),
            () => (
              <div>
                {this.renderGuide()}
                {this.renderAlerts()}
                {this.renderHeader()}
                {this.renderRouteHandler()}
                {this.renderFooter()}
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  protected renderGuide() {
    if (this.props.guide) {
      return this.props.guide === true ? <BootstrapGuide /> : this.props.guide;
    }

    return false;
  }

  protected renderAlerts() {
    if (this.props.alerts && this.viewModel.alerts) {
      const alerts =
        this.props.alerts === true ? (
          <AlertHostView viewModel={this.viewModel.alerts} />
        ) : (
          this.props.alerts(this.viewModel.alerts, this.props)
        );

      return (
        <div className="float-container">
          <Grid fluid={this.props.responsive}>{alerts}</Grid>
        </div>
      );
    }

    return false;
  }

  protected renderHeader() {
    if (this.props.header && this.viewModel.header) {
      return this.props.header === true ? (
        <PageHeaderView
          viewModel={this.viewModel.header}
          brand={this.props.brand}
          branduri={this.props.branduri}
          responsive={this.props.responsive}
        />
      ) : (
        this.props.header(this.viewModel.header, this.props)
      );
    }

    return false;
  }

  protected renderRouteHandler() {
    if (this.props.routeHandler) {
      return this.props.routeHandler(this.viewModel.routeHandler, this.props);
    }

    return (
      <RouteHandlerView
        viewModel={this.viewModel.routeHandler}
        viewMap={this.props.viewMap!}
        responsive={this.props.responsive}
      />
    );
  }

  protected renderFooter() {
    if (this.props.footer && this.viewModel.footer) {
      const footerProps = {
        copyright: this.props.copyright,
        copyrightYear: this.props.copyrightYear,
        copyrightUri: this.props.copyrightUri,
        footerContent: this.props.footerContent,
        hideDimensions: this.props.hideDimensions,
      };

      return this.props.footer === true ? (
        <PageFooterView
          viewModel={this.viewModel.footer}
          responsive={this.props.responsive}
          {...footerProps}
        />
      ) : (
        this.props.footer(this.viewModel.footer, this.props)
      );
    }

    return false;
  }
}
