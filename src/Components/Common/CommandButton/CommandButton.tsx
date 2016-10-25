import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';
import { Button, ButtonProps } from 'react-bootstrap';

export interface CommandButtonProps extends ButtonProps {
  command?: wx.ICommand<any> | { (): wx.ICommand<any> };
  commandParameter?: any;
}

export class CommandButton extends React.Component<CommandButtonProps, any> {
  public static displayName = 'CommandButton';

  private canExecuteSubscription: Rx.IDisposable;

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
        .subscribe(() => this.forceUpdate());
    }
  }

  componentWillUnmount() {
    if (this.canExecuteSubscription != null) {
      this.canExecuteSubscription.dispose();
      this.canExecuteSubscription = null;
    }
  }

  render() {
    const { rest, props } = Object.rest(this.props, x => {
      const { command, commandParameter } = x;
      return { command, commandParameter };
    }, 'key', 'ref');

    let canExecute = false;
    let onClick: Function = null;

    if (props.command == null) {
      // if props.command is null, try to fall back onto href
      canExecute = String.isNullOrEmpty(rest.href) === false;
    }
    else {
      canExecute = this.getCommand().canExecute(this.getParam());
      onClick = () => this.getCommand().execute(this.getParam());
    }

    return (
      <Button { ...rest } disabled={ canExecute !== true } onClick={ onClick } />
    );
  }
}
