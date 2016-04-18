/// <reference path="./Extensions.d.ts"/>

import * as wx from 'webrx';

function catchExceptions<T>(onError: (error: Error) => void) {
  const command = this as wx.ICommand<T>;

  command.thrownExceptions.subscribe((error: Error) => {
    onError(error);
  });

  return command;
}

function wrapCommand<T extends Function>(func: T, thisArg?: any) {
  return <T><Function>function() {
    const cmd = func.apply(thisArg, arguments);
    cmd.catchExceptions = catchExceptions;
    return cmd;
  };
}

wx.command = wrapCommand(wx.command);
wx.asyncCommand = wrapCommand(wx.asyncCommand);
