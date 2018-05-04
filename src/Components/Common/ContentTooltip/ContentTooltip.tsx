import * as React from 'react';
import { Tooltip, Popover, OverlayTrigger } from 'react-bootstrap';

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';

export interface ContentTooltipProps {
  content: any;
  id?: string;
  className?: string;
  placement?: TooltipPlacement;
  title?: any;
  trigger?: string | string[];
  popover?: boolean;
  context?: React.ReactElement<any>;
}

export interface ContentTooltipComponentProps extends ContentTooltipProps {
}

export class ContentTooltip extends React.Component<ContentTooltipComponentProps> {
  render() {
    const content = this.props.content;
    const context = this.props.context || React.Children.only(this.props.children);

    if (String.isNullOrEmpty(content) || content === false) {
      return context;
    }

    if (React.isValidElement(content)) {
      if (React.isType(content, ContentTooltip)) {
        return React.cloneElement(content, {}, context);
      }

      if (React.isType(content, OverlayTrigger)) {
        return this.renderOverlayTrigger(content, context);
      }

      if (React.isType(content, Popover) || React.isType(content, Tooltip)) {
        return this.renderOverlay(content, context);
      }
    }

    return this.renderOverlayContent(content, context);
  }

  // content is an OverlayTrigger
  protected renderOverlayTrigger(content: React.ReactElement<any>, context: any) {
    const props = this.trimProps({
      placement: this.props.placement,
      trigger: this.props.trigger,
    });

    return React.cloneElement(content, props, context);
  }

  // content is an Overlay (Popover, Tooltip)
  protected renderOverlay(content: React.ReactElement<any>, context: any) {
    const props = this.trimProps({
      id: this.props.id || content.props.id || context.id,
      className: this.wxr.classNames(this.props.className, content.props.className),
      placement: this.props.placement || content.props.placement,
      title: this.props.title,
    });

    if (!React.isType(content, Popover)) {
      delete props.title;
    }

    const overlay = React.cloneElement(content, props);

    const overlayTrigger = (
      <OverlayTrigger overlay={ overlay } placement={ overlay.props.placement } />
    );

    return this.renderOverlayTrigger(overlayTrigger, context);
  }

  protected renderOverlayContent(content: React.ReactChild, context: any) {
    if (!React.isValidElement(content) && Object.isObject(content)) {
      const props: any = content;
      const Component = props.title != null || props.popover || this.props.title != null || this.props.popover ?
        Popover :
        Tooltip;

      return this.renderOverlay(
        (
          <Component id={ props.id || this.props.id } { ...props } />
        ),
        context,
      );
    }

    if (this.props.title != null || this.props.popover) {
      const popover = (
        <Popover id={ this.props.id }>
          { content }
        </Popover>
      );

      return this.renderOverlay(popover, context);
    }

    const tooltip = (
      <Tooltip id={ this.props.id }>
        { content }
      </Tooltip>
    );

    return this.renderOverlay(tooltip, context);
  }
}
