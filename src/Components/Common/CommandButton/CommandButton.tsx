import * as React from 'react';
import * as classNames from 'classnames';
import { IDisposable } from  'rx';
import * as wx from 'webrx';
import { Button, ButtonProps } from 'react-bootstrap';

import './CommandButton.less';

export interface CommandButtonProps extends ButtonProps {
  command?: wx.ICommand<any> | { (): wx.ICommand<any> };
  commandParameter?: any;
  stopPropagation?: boolean;
  preventDefault?: boolean;
  plain?: boolean;
}

export class CommandButton extends React.Component<CommandButtonProps, any> {
  public static displayName = 'CommandButton';

  private canExecuteSubscription: IDisposable;

  private getCommand(): wx.ICommand<any> {
    const cmd = this.props.command;

    return (cmd instanceof Function) ? cmd.apply(null) : cmd;
  }

  private getParam() {
    const param = this.props.commandParameter;

    return (param instanceof Function) ? param.apply(null) : param;
  }

  componentWillMount() {
    if (this.props.command != null) {
      this.canExecuteSubscription = this.getCommand().canExecuteObservable
        .subscribe(() => {
          this.forceUpdate();
        });
    }
  }

  componentWillUnmount() {
    if (this.canExecuteSubscription != null) {
      this.canExecuteSubscription.dispose();
      this.canExecuteSubscription = null;
    }
  }

  render() {
    const { className, children, rest, props } = this.restProps(x => {
      const { onClick, command, commandParameter, stopPropagation, preventDefault, plain } = x;
      return { onClick, command, commandParameter, stopPropagation, preventDefault, plain };
    });

    const canExecute = (props.command == null) ?
      // no command was supplied so check both href and onClick to see if this button is enabled
      String.isNullOrEmpty(rest.href) === false || props.onClick != null :
      // use the command to see if this button is enabled
      this.getCommand().canExecute(this.getParam());

    return (
      <Button { ...rest } className={ classNames('CommandButton', className, { plain: props.plain }) } disabled={ canExecute !== true } onClick={ e => this.handleClick(e) }>
        { children }
      </Button>
    );
  }

  private handleClick(e: React.MouseEvent<Button>) {
    if (this.props.command == null) {
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

      this.getCommand().execute(this.getParam());
    }
  }
}
