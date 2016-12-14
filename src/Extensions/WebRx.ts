import { Observable } from 'rx';
import * as wx from 'webrx';

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

// this is a patch for invokeCommand to support command selector parameters
function invokeCommand<T, TResult>(command: (x: T) => wx.ICommand<TResult> | wx.ICommand<TResult>) {
  // see the ReactiveUI project for the inspiration behind this function:
  // https://github.com/reactiveui/ReactiveUI/blob/master/ReactiveUI/ReactiveCommand.cs#L524
  return (this as Observable<T>)
    .select(x => ({
      parameter: x,
      command: <wx.ICommand<TResult>>(command instanceof Function ? command(x) : command),
    }))
    .debounce(x => x.command.canExecuteObservable.startWith(x.command.canExecute(x.parameter)).where(b => b))
    .select(x => x.command.executeAsync(x.parameter).catch(Observable.empty<TResult>()))
    .switch()
    .subscribe();
}

(<any>Observable).prototype.invokeCommand = invokeCommand;
