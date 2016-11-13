import { IDisposable } from 'rx';
import * as wx from 'webrx';

declare module 'rx' {
  interface Observable<T> {
    // the invokeCommand Rx extensions aren't currently published so we'll add them here for now
    invokeCommand<TResult>(command: wx.ICommand<TResult>): IDisposable;
    invokeCommand<TResult>(commandSelector: (x: T) => wx.ICommand<TResult>): IDisposable;
  }
}

declare module 'webrx' {
  // we don't have control over the interface name for this augmentation
  // tslint:disable-next-line:interface-name
  interface ICommand<T> {
    catchExceptions(onError: (error: Error) => void): ICommand<T>;
  }
}

function catchExceptions<T>(onError: (error: Error) => void) {
  const command = this as wx.ICommand<T>;

  command.thrownExceptions.subscribe((error: Error) => {
    onError(error);
  });

  return command;
}

function wrapCommand<T extends Function>(func: T, thisArg?: any) {
  return <T><Function>function() {
    const cmd = <wx.ICommand<T>>func.apply(thisArg, arguments);
    cmd.catchExceptions = catchExceptions;
    return cmd;
  };
}

(<any>wx).command = wrapCommand(wx.command);
(<any>wx).asyncCommand = wrapCommand(wx.asyncCommand);
