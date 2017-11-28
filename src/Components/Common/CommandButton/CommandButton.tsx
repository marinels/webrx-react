import * as React from 'react';
import { Subscription } from  'rxjs';
import { Button, ButtonProps, OverlayTrigger, Tooltip } from 'react-bootstrap';

import { Command } from '../../../WebRx';

export interface CommandButtonProps {
  id?: string;
  command?: Command<any> | { (): Command<any> };
  commandParameter?: any;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  plain?: boolean;
  tooltip?: any;
}

export interface CommandButtonComponentProps extends ButtonProps, CommandButtonProps {
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
      const { onClick, command, commandParameter, stopPropagation, preventDefault, plain, tooltip, disabled, componentClass } = x;
      return { onClick, command, commandParameter, stopPropagation, preventDefault, plain, tooltip, disabled, componentClass };
    });

    return this.renderButton(rest);
  }

  private renderButton(rest: any) {
    const cmd = this.props.disabled === true ? undefined : this.getCommand();

    const canExecute = cmd == null ?
      // no command was supplied so check both href and onClick to see if this button is enabled
      String.isNullOrEmpty(rest.href) === false || this.props.onClick != null :
      // use the command to see if this button is enabled
      cmd.canExecute;

    const button = (
      <Button { ...rest }
        className={ this.wxr.classNames('CommandButton', this.props.className, { plain: this.props.plain }) }
        disabled={ canExecute !== true }
        onClick={ e => this.handleClick(e) }
        componentClass={ this.getComponentClass() }
      >
        { this.props.children }
      </Button>
    );

    const tooltip = (this.props.tooltip != null && String.isString(this.props.tooltip)) ?
      (<Tooltip id={ `${ this.props.id }-tt` }>{ this.props.tooltip }</Tooltip>) :
      this.props.tooltip;

    if (React.isValidElement<any>(tooltip)) {
      if (React.isType(tooltip, OverlayTrigger)) {
        return React.cloneElement(tooltip as any, { key: button.key }, button);
      }
      else {
        return (
          <OverlayTrigger key={ button.key || undefined } placement={ tooltip.props.placement } overlay={ tooltip } >
            { button }
          </OverlayTrigger>
        );
      }
    }
    else {
      return button;
    }
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
