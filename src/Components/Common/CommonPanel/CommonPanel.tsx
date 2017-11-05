import * as React from 'react';
import { Panel, PanelProps, ButtonToolbar } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';

export type CommonPannelContent = ((x: CommonPanel) => any) | any;
export type CommonPanelSectionFormatter = (section: any) => any;
export type CommonPanelContentSection = 'header' | 'body' | 'footer';
export type CommonPanelContentType = 'teaser' | 'summary';

export type PanelAction = CommandButtonProps & { children?: React.ReactNode; };

export interface CommonPanelProps {
  headerContent?: CommonPannelContent;
  headerActions?: Array<PanelAction>;
  headerFormat?: CommonPanelSectionFormatter;
  teaserContent?: CommonPannelContent;
  summaryContent?: CommonPannelContent;
  footerContent?: CommonPannelContent;
  footerActions?: Array<PanelAction>;
  footerFormat?: CommonPanelSectionFormatter;

  shadow?: boolean;
}

export interface CommonPanelComponentProps extends PanelProps, CommonPanelProps {
}

export class CommonPanel extends React.Component<CommonPanelComponentProps> {
  public static displayName = 'CommonPanel';

  static defaultProps = {
    defaultExpanded: true,
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions, footerFormat, shadow } = x;
      return { headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions, footerFormat, shadow };
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
      <Panel { ...rest } className={ panelClassName }
        header={ rest.header || this.renderHeaderFooter(props.headerContent, props.headerActions, 'header', props.headerFormat) }
        footer={ rest.footer || this.renderHeaderFooter(props.footerContent, props.footerActions, 'footer', props.footerFormat) }
      >
        { this.renderContent(props.teaserContent, 'body', 'teaser') }
        { children }
        { this.renderContent(props.summaryContent, 'body', 'summary') }
      </Panel>
    );
  }

  private renderContent(content: CommonPannelContent | undefined, section: CommonPanelContentSection, sectionType?: CommonPanelContentType) {
    return this.wxr.renderNullable(content, x => (
      <div className={ this.wxr.classNames(`CommonPanel-${ section }Content`, sectionType == null ? null : `CommonPanel-${ sectionType }`) }>
        { x instanceof Function ? x(this) : x }
      </div>
    ));
  }

  private renderActions(actions: CommandButtonProps[] | undefined, section: CommonPanelContentSection) {
    return this.wxr.renderNullable(actions, a => (
      <ButtonToolbar className={ `CommonPanel-${ section }Actions` }>
        {
          a
            // strip off the ref prop if it exists
            .map(x => Object.rest(x, undefined, 'ref').rest as any)
            .map(x => (<CommandButton key={ x.id } { ...x } />))
        }
      </ButtonToolbar>
    ), undefined, x => x.length > 0);
  }

  private renderHeaderFooter(content: CommonPannelContent | undefined, actions: CommandButtonProps[] = [], section: CommonPanelContentSection, formatter: (section: any) => any = x => x) {
    return this.wxr.renderConditional(
      content != null || (actions != null && actions.length > 0),
      () => formatter(
        <div className={ `CommonPanel-${ section }` }>
          { this.renderContent(content, section) }
          { this.renderActions(actions, section) }
        </div>,
      ),
    );
  }
}
