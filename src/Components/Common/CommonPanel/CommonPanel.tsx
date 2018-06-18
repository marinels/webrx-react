// tslint:disable:max-classes-per-file

import * as React from 'react';
import { ButtonToolbar, Panel, PanelProps, TransitionCallbacks } from 'react-bootstrap';

import { CommandButton } from '../CommandButton/CommandButton';

export type CommonPannelContent = ((x: CommonPanel) => any) | any;
export type CommonPanelSectionFormatter = (section: any) => any;
export type CommonPanelContentSection = 'header' | 'body' | 'footer';
export type CommonPanelContentType = 'teaser' | 'summary';

export interface CommonPanelActionsProps {
  section?: CommonPanelContentSection;
}

export class CommonPanelActions extends React.Component<CommonPanelActionsProps> {
  render() {
    return (
      <ButtonToolbar className={ `CommonPanel-${ this.props.section }Actions` }>
        { this.props.children }
      </ButtonToolbar>
    );
  }
}

export type BootstrapPanelProps = Omit2<PanelProps, React.HTMLProps<Panel>, TransitionCallbacks>;

export interface CommonPanelRenderProps extends BootstrapPanelProps {
  headerContent?: CommonPannelContent;
  headerActions?: any;
  headerFormat?: CommonPanelSectionFormatter;
  teaserContent?: CommonPannelContent;
  summaryContent?: CommonPannelContent;
  footerContent?: CommonPannelContent;
  footerActions?: any;
  footerFormat?: CommonPanelSectionFormatter;

  shadow?: boolean;
}

export interface CommonPanelProps extends PanelProps, CommonPanelRenderProps {
}

export class CommonPanel extends React.Component<CommonPanelProps> {
  public static displayName = 'CommonPanel';

  public static Actions = CommonPanelActions;

  static defaultProps: Partial<CommonPanelProps> = {
    defaultExpanded: true,
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const {
        headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions,
        footerFormat, shadow,
      } = x;
      return {
        headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions,
        footerFormat, shadow,
      };
    });

    const panelClassName = this.wxr.classNames(
      'CommonPanel',
      {
        shadow: props.shadow === true,
        collapsible: rest.collapsible,
      },
      className,
    );

    return (
      <Panel
        { ...rest }
        className={ panelClassName }
        header={
          rest.header || this.renderHeaderFooter(props.headerContent, props.headerActions, 'header', props.headerFormat)
        }
        footer={
          rest.footer || this.renderHeaderFooter(props.footerContent, props.footerActions, 'footer', props.footerFormat)
        }
      >
        { this.renderContent(props.teaserContent, 'body', 'teaser') }
        { children }
        { this.renderContent(props.summaryContent, 'body', 'summary') }
      </Panel>
    );
  }

  private renderContent(
    content: CommonPannelContent | undefined,
    section: CommonPanelContentSection,
    sectionType?: CommonPanelContentType,
  ) {
    return this.wxr.renderNullable(content, x => (
      <div
        className={
          this.wxr
            .classNames(`CommonPanel-${ section }Content`, sectionType == null ? null : `CommonPanel-${ sectionType }`)
        }
      >
        { x instanceof Function ? x(this) : x }
      </div>
    ), undefined, x => x !== false);
  }

  private renderActions(actions: any, section: CommonPanelContentSection) {
    return this.wxr
      .renderNullable(
        actions,
        a => {
          if (React.isValidElement<any>(a)) {
            if (a.type === CommonPanelActions) {
              return React.cloneElement(a, { section });
            }

            return a;
          }

          if (a instanceof Function) {
            return a(this);
          }

          return (
            <CommonPanelActions section={ section }>
              {
                Array.isArray(a) ?
                  a
                    .map((x, i) => (<CommandButton key={ x.id || i } { ...x } />)) :
                  (<CommandButton { ...a } />)
              }
            </CommonPanelActions>
          );
        },
        undefined,
        x => x !== false,
      );
  }

  private renderHeaderFooter(
    content: CommonPannelContent | undefined,
    actions: any,
    section: CommonPanelContentSection,
    formatter: (section: any) => any = x => x,
  ) {
    return this.wxr.renderConditional(
      content != null || actions != null,
      () => formatter(
        <div className={ `CommonPanel-${ section }` }>
          { this.renderContent(content, section) }
          { this.renderActions(actions, section) }
        </div>,
      ),
    );
  }
}
