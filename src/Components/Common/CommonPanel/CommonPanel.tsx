import * as React from 'react';
import * as classNames from 'classnames';
import { Panel, PanelProps, ButtonToolbar } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';
import { wxr } from '../../React';

import './CommonPanel.less';

export type CommonPannelContent = ((x: CommonPanel) => any) | any;
export type CommonPanelSectionFormatter = (section: any) => any;
export type CommonPanelContentSection = 'header' | 'body' | 'footer';
export type CommonPanelContentType = 'teaser' | 'summary';

export interface CommonPanelProps extends PanelProps {
  headerContent?: CommonPannelContent;
  headerActions?: CommandButtonProps[];
  headerFormat?: CommonPanelSectionFormatter;
  teaserContent?: CommonPannelContent;
  summaryContent?: CommonPannelContent;
  footerContent?: CommonPannelContent;
  footerActions?: CommandButtonProps[];
  footerFormat?: CommonPanelSectionFormatter;

  shadow?: boolean;
}

export class CommonPanel extends React.Component<CommonPanelProps, any> {
  public static displayName = 'CommonPanel';

  static defaultProps = {
    defaultExpanded: true,
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions, footerFormat, shadow } = x;
      return { headerContent, headerActions, headerFormat, teaserContent, summaryContent, footerContent, footerActions, footerFormat, shadow };
    });

    const panelClassName = classNames(
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
    return wxr.renderNullable(content, x => (
      <div className={ classNames(`CommonPanel-${ section }Content`, sectionType == null ? null : `CommonPanel-${ sectionType }`) }>
        { x instanceof Function ? x(this) : x }
      </div>
    ));
  }

  private renderActions(actions: CommandButtonProps[] | undefined, section: CommonPanelContentSection) {
    return wxr.renderNullable(actions, a => (
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
    return wxr.renderConditional(
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
