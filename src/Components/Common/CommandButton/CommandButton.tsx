import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';
import { Button, ButtonProps } from 'react-bootstrap';

export interface CommandButtonProps extends ButtonProps {
  command: () => wx.ICommand<any> | wx.ICommand<any>;
  commandParameter?: any;
}

export class CommandButton extends React.Component<CommandButtonProps, any> {
  public static displayName = 'CommandButton';

  private canExecuteSubscription: Rx.IDisposable;

  private getCommand(): wx.ICommand<any> {
    return (this.props.command instanceof Function) ?
      this.props.command.apply(null) :
      this.props.command;
  }

  private getParam() {
    return (this.props.commandParameter instanceof Function) ?
      this.props.commandParameter.apply(null) :
      this.props.commandParameter;
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
    });

    const canExecute = props.command == null ? null : this.getCommand().canExecute(this.getParam());
    const onClick = props.command == null ? null : () => this.getCommand().execute(this.getParam());

    return (
      <Button { ...rest } disabled={ canExecute !== true } onClick={ onClick } />
    );
  }
}
