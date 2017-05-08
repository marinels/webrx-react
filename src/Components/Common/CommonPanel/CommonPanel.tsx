import * as React from 'react';
import * as classNames from 'classnames';
import { Panel, PanelProps, ButtonToolbar } from 'react-bootstrap';

import { CommandButton, CommandButtonProps } from '../CommandButton/CommandButton';
import { renderConditional } from '../../React/RenderHelpers';

import './CommonPanel.less';

type Content = ((x: CommonPanel) => any) | any;
type SectionFormatter = (section: any) => any;
type ContentSection = 'header' | 'body' | 'footer';
type ContentType = 'teaser' | 'summary';

export interface CommonPanelProps extends PanelProps {
  headerContent?: Content;
  headerActions?: CommandButtonProps[];
  headerFormat?: SectionFormatter;
  teaserContent?: Content;
  summaryContent?: Content;
  footerContent?: Content;
  footerActions?: CommandButtonProps[];
  footerFormat?: SectionFormatter;

  shadow?: boolean;
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
            .map(x => Object.rest(x, undefined, 'ref').rest as any)
            .map(x => (<CommandButton key={ x.id } { ...x } />))
        }
      </ButtonToolbar>
    ));
  }

  private renderHeaderFooter(content: Content, actions: CommandButtonProps[] = [], section: ContentSection, formatter: (section: any) => any = x => x) {
    return renderConditional(
      content != null || (actions != null && actions.length > 0),
      () => formatter(
        <div className={ `CommonPanel-${ section }` }>
          { this.renderContent(content, section) }
          { this.renderActions(actions, section) }
        </div>
      ),
    );
  }
}
