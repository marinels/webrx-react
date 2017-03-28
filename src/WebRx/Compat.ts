import { Observable } from 'rx';

import { ReadOnlyProperty, Property, Command, ObservableOrProperty as OoP } from './Interfaces';
import { isProperty as isPropertyFunc, isCommand as isCommandFunc, isObservable } from './Utils';
import { property as propertyFunc } from './Property';
import { command as commandFunc } from './Command';
import { whenAny as whenAnyFunc } from './WhenAny';

export namespace wx {
  export const property = propertyFunc;
  export const command = commandFunc;
  export const whenAny = whenAnyFunc;

  export const isCommand = isCommandFunc;
  export const isProperty = isPropertyFunc;

  export type IObservableProperty<T> = Property<T>;
  export type IObservableReadOnlyProperty<T> = ReadOnlyProperty<T>;
  export type ICommand<T> = Command<T>;
  export type ObservableOrProperty<T> = OoP<T>;

  export function asyncCommand<T>(execute: (parameter: any) => Observable<T>): Command<T>;
  export function asyncCommand<T>(canExecute: Observable<boolean>, execute: (parameter: any) => Observable<T>): Command<T>;
  export function asyncCommand<T>(arg1: Observable<boolean> | ((parameter: any) => Observable<T>), execute?: (parameter: any) => Observable<T>) {
    if (isObservable(arg1)) {
      return commandFunc(execute, arg1);
    }

    return commandFunc(execute);
  }
}
