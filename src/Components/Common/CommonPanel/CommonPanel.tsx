import * as React from 'react';
import * as classNames from 'classnames';
import { Panel, PanelProps, ButtonToolbar, Clearfix } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';
import { renderConditional } from '../../React/RenderHelpers';

import './CommonPanel.less';

type Content = ((x: CommonPanel) => any) | any;
type ContentSection = 'header' | 'body' | 'footer';
type ContentType = 'teaser' | 'summary';

export interface CommonPanelProps extends PanelProps {
  headerContent: Content;
  headerActions?: CommandButtonProps[];
  teaserContent?: Content;
  summaryContent?: Content;
  footerContent?: Content;
  footerActions?: CommandButtonProps[];

  shadow?: boolean;

  children?: any;
}

export class CommonPanel extends React.Component<CommonPanelProps, any> {
  public static displayName = 'CommonPanel';

  static defaultProps = {
    shadow: false,
    collapsible: false,
    defaultExpanded: true,
  };

  render() {
    const { className, children, props, rest } = this.restProps(x => {
      const { headerContent, headerActions, teaserContent, summaryContent, footerContent, footerActions, shadow } = x;
      return { headerContent, headerActions, teaserContent, summaryContent, footerContent, footerActions, shadow };
    });

    const panelClassName = classNames(
      'CommonPanel',
      {
        shadow: props.shadow === true,
        collapsible: rest.collapsible,
      },
      className
    );

    return (
      <Panel { ...rest } className={ panelClassName }
        header={ rest.header || this.renderHeaderFooter(props.headerContent, props.headerActions, 'header') }
        footer={ rest.footer || this.renderHeaderFooter(props.footerContent, props.footerActions, 'footer') }
      >
        { this.renderContent(props.teaserContent, 'body', 'teaser') }
        { children }
        { this.renderContent(props.summaryContent, 'body', 'summary') }
      </Panel>
    );
  }

  private renderContent(content: Content, section: ContentSection, sectionType?: ContentType) {
    return renderConditional(content != null, () => (
      <div className={ classNames(`CommonPanel-${ section }Content`, sectionType == null ? null : `CommonPanel-${ sectionType }`) }>
        { content instanceof Function ? content.apply(this, [ this ]) : content }
      </div>
    ));
  }

  private renderActions(actions: CommandButtonProps[], section: ContentSection) {
    return renderConditional(actions != null && actions.length > 0, () => (
      <ButtonToolbar className={ `CommonPanel-${ section }Actions` }>
        {
          actions
            // strip off the ref prop if it exists
            .map(x => Object.rest(x, null, 'ref').rest as any)
            .map(x => (<CommandButton key={ x.id } { ...x } />))
        }
      </ButtonToolbar>
    ));
  }

  private renderHeaderFooter(content: Content, actions: CommandButtonProps[], section: ContentSection) {
    return renderConditional(content != null, () => (
      <div className={ `CommonPanel-${ section }` }>
        { this.renderContent(content, section) }
        { this.renderActions(actions, section) }
        <Clearfix />
      </div>
    ));
  }
}
