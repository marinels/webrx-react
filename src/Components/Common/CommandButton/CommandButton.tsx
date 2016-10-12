import * as React from 'react';
import * as Rx from 'rx';
import * as wx from 'webrx';
import { Button, ButtonProps } from 'react-bootstrap';

export interface CommandButtonProps extends ButtonProps {
  command: wx.ICommand<any>;
  commandParameter?: any;
}

export class CommandButton extends React.Component<CommandButtonProps, any> {
  public static displayName = 'CommandButton';

  private canExecuteSubscription: Rx.IDisposable;

  componentWillMount() {
    if (this.props.command != null) {
      this.canExecuteSubscription = this.props.command.canExecuteObservable
        .subscribe(() => this.forceUpdate());
    }
  }

  componentWillUnmount() {
    if (this.canExecuteSubscription != null) {
      this.canExecuteSubscription.dispose();
      this.canExecuteSubscription = null;
    }
  }

  private getParam() {
    return (this.props.commandParameter instanceof Function) ?
      this.props.commandParameter.apply() :
      this.props.commandParameter;
  }

  render() {
    const { rest, props } = Object.rest(this.props, x => {
      const { command, commandParameter, children } = x;
      return { command, commandParameter, children };
    });

    const canExecute = props.command == null ? null : props.command.canExecute(this.getParam());
    const onClick = props.command == null ? null : () => props.command.execute(this.getParam());

    return (
      <Button { ...rest } disabled={ canExecute !== true } onClick={ onClick } >{ props.children }</Button>
    );
  }
}
