import * as React from 'react';
import { Subscription } from  'rxjs';
import { Button, ButtonProps } from 'react-bootstrap';

import { ContentTooltip, TooltipPlacement } from '../ContentTooltip/ContentTooltip';
import { Command } from '../../../WebRx';

export interface CommandButtonProps extends Omit<ButtonProps, React.HTMLProps<Button>> {
  id?: string;
  command?: Command<any> | { (): Command<any> };
  commandParameter?: any;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  plain?: boolean;
  compact?: boolean;
  tooltip?: any;
  tooltipPlacement?: TooltipPlacement;
}

export interface CommandButtonComponentProps extends React.HTMLProps<any>, CommandButtonProps {
}

export class CommandButton extends React.Component<CommandButtonComponentProps> {
  public static displayName = 'CommandButton';

  private canExecuteSubscription = Subscription.EMPTY;

  private getCommand(): Command<any> | undefined {
    const cmd = this.props.command;

    return (cmd instanceof Function) ? cmd() : cmd;
  }

  private getParam() {
    const param = this.props.commandParameter;

    return (param instanceof Function) ? param() : param;
  }

  componentWillMount() {
    const cmd = this.getCommand();

    if (cmd != null) {
      this.canExecuteSubscription = cmd.canExecuteObservable
        .merge(cmd.conditionObservable)
        .subscribe(() => {
          this.forceUpdate();
        });
    }
  }

  componentWillUnmount() {
    this.canExecuteSubscription = Subscription.unsubscribe(this.canExecuteSubscription);
  }

  render() {
    const { rest } = this.restProps(x => {
      const { onClick, command, commandParameter, stopPropagation, preventDefault, plain, compact, tooltip, tooltipPlacement, disabled, componentClass } = x;
      return { onClick, command, commandParameter, stopPropagation, preventDefault, plain, compact, tooltip, tooltipPlacement, disabled, componentClass };
    });

    return this.renderButton(rest);
  }

  private renderButton(rest: any) {
    const cmd = this.props.disabled === true ? undefined : this.getCommand();

    const canExecute = cmd == null ?
      // no command was supplied so check both href and onClick to see if this button is enabled
      String.isNullOrEmpty(rest.href) === false || this.props.onClick != null :
      // use the command to see if this button is enabled
      cmd.canExecuteFor(this.props.commandParameter);

    const disabled = this.props.disabled || canExecute !== true;

    const classNames = this.wxr.classNames(
      'CommandButton',
      this.props.className,
      {
        plain: this.props.plain,
        compact: this.props.compact,
      },
    );

    const button = (
      <Button { ...rest }
        className={ classNames }
        disabled={ disabled }
        onClick={ disabled ? undefined : this.handleClick.bind(this) }
        componentClass={ this.getComponentClass() }
      >
        { this.props.children }
      </Button>
    );

    if (this.props.tooltip == null || this.props.tooltip === false) {
      return button;
    }

    const ttId = this.props.id ? `${ this.props.id }-tt` : undefined;

    return (
      <ContentTooltip id={ ttId } className={ this.props.className } content={ this.props.tooltip } placement={ this.props.tooltipPlacement }>
        { button }
      </ContentTooltip>
    );
  }

  protected getComponentClass() {
    if (this.props.componentClass != null) {
      return this.props.componentClass;
    }

    if (this.props.command == null && String.isNullOrEmpty(this.props.href) === false) {
      return 'a';
    }

    return 'div';
  }

  protected handleClick(e: React.MouseEvent<Button>) {
    const cmd = this.getCommand();

    if (cmd == null) {
      if (this.props.onClick != null) {
        // onClick was supplied so we don't override default click handling unless explicitly defined
        if (this.props.stopPropagation === true) {
          e.stopPropagation();
        }

        if (this.props.preventDefault === true) {
          e.preventDefault();
        }

        this.props.onClick(e);
      }
      else if (String.isNullOrEmpty(this.props.href) === false) {
        // we stop propagation by default (this prevents things below the button from being activated)
        if (this.props.stopPropagation !== false) {
          e.stopPropagation();
        }

        // we don't disable default click behaviour (this allows href's to be managed with default behaviour)
        if (this.props.preventDefault === true) {
          e.preventDefault();
        }
      }
    }
    else {
      // command was supplied so we disable default click handling unless explicitly disabled
      if (this.props.stopPropagation !== false) {
        e.stopPropagation();
      }

      if (this.props.preventDefault !== false) {
        e.preventDefault();
      }

      cmd.execute(this.getParam(), () => {
        if (this.props.onClick != null) {
          this.props.onClick(e);
        }
      });
    }
  }
}
