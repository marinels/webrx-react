import * as React from 'react';
import * as classNames from 'classnames';
import { IDisposable } from  'rx';
import * as wx from 'webrx';
import { Button, ButtonProps } from 'react-bootstrap';

export interface CommandButtonProps extends ButtonProps {
  command?: wx.ICommand<any> | { (): wx.ICommand<any> };
  commandParameter?: any;
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
      const { onClick, command, commandParameter } = x;
      return { onClick, command, commandParameter };
    });

    let canExecute = false;
    let onClick: React.MouseEventHandler<Button> = null;

    if (props.command == null) {
      // if props.command is null, try to fall back onto href
      canExecute = String.isNullOrEmpty(rest.href) === false || props.onClick != null;
      onClick = e => {
        e.stopPropagation();
        e.preventDefault();

        if (props.onClick != null) {
          props.onClick(e);
        }
      };
    }
    else {
      canExecute = this.getCommand().canExecute(this.getParam());
      onClick = e => {
        e.stopPropagation();
        e.preventDefault();

        this.getCommand().execute(this.getParam());
      };
    }

    return (
      <Button { ...rest } className={ classNames('CommandButton', className) } disabled={ canExecute !== true } onClick={ onClick }>
        { children }
      </Button>
    );
  }
}
