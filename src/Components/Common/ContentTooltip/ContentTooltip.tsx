import * as React from 'react';
import { Tooltip, Popover, OverlayTrigger } from 'react-bootstrap';

export interface ContentTooltipProps {
  content: any;
  id?: string;
  placement?: string;
  trigger?: string | string[];
  title?: any;
  popover?: boolean;
  context?: React.ReactElement<any>;
}

export interface ContentTooltipComponentProps extends ContentTooltipProps {
}

export class ContentTooltip extends React.Component<ContentTooltipComponentProps> {
  render() {
    const content = this.props.content;
    const context = this.props.context || React.Children.only(this.props.children);

    if (content == null) {
      return context;
    }

    if (React.isValidElement(content)) {
      if (content.type === OverlayTrigger) {
        return this.renderOverlayTrigger(content, context);
      }

      if (content.type === Popover || content.type === Tooltip) {
        return this.renderOverlay(content, context);
      }
    }

    return this.renderOverlayContent(content, context);
  }

  protected renderOverlayTrigger(content: React.ReactElement<any>, context: any) {
    const props = {
      placement: this.props.placement,
      trigger: this.props.trigger,
      ...content.props,
    };

    return React.cloneElement(content, props, context);
  }

  protected renderOverlay(content: React.ReactElement<any>, context: any) {
    const props = {
      id: context.id,
      placement: this.props.placement,
      title: this.props.title,
      ...content.props,
    };

    if (content.type !== Popover) {
      delete props.title;
    }

    const overlay = React.cloneElement(content, props);
    const overlayTrigger = (
      <OverlayTrigger overlay={ overlay } />
    );

    return this.renderOverlayTrigger(overlayTrigger, context);
  }

  protected renderOverlayContent(content: React.ReactChild, context: any) {
    const props = {
      id: this.props.id,
      placement: this.props.placement,
    };

    if (this.props.title != null || this.props.popover) {
      const popover = (
        <Popover { ...props } title={ this.props.title }>
          { content }
        </Popover>
      );

      return this.renderOverlay(popover, context);
    }

    const tooltip = (
      <Tooltip { ...props }>
        { content }
      </Tooltip>
    );

    return this.renderOverlay(tooltip, context);
  }
}
