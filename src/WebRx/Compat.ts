import { Observable } from 'rx';

import { ReadOnlyProperty, Property, Command, ObservableOrProperty as OoP } from './Interfaces';
import { isProperty as isPropertyFunc, isCommand as isCommandFunc, isObservable as isObservableFunc, getObservable as getObservableFunc } from './Utils';
import { ObservableProperty, property as propertyFunc } from './Property';
import { ObservableCommand, command as commandFunc } from './Command';
import { whenAny as whenAnyFunc } from './WhenAny';

declare module './Interfaces' {
  interface Command<T> {
    readonly isExecuting: Observable<boolean>;

    canExecute(parameter?: any): boolean;
    executeAsync(parameter?: any): Observable<T>;
  }

  interface ReadOnlyProperty<T>  {
    (): T;
  }

  interface Property<T> {
    (): T;
    (value: T): void;
  }
}

declare module './Command' {
  interface ObservableCommand<T> {
    executeAsync: (parameter?: any) => Observable<T>;
  }
}
ObservableCommand.prototype.executeAsync = ObservableCommand.prototype.observeExecution;

function createCompatProperty<T>(prop: ObservableProperty<T>) {
  const accessor = Object.assign<Property<T>>(function(this: Property<T>, value: T) {
    if (arguments.length === 0) {
      return prop.value;
    }

    prop.value = value;

    return undefined;
  }, prop, {
    dispose: prop.dispose,
  });

  (<any>accessor).prop = prop;

  Object.defineProperty(accessor, 'isReadOnly', {
    get: function() {
      return prop.isReadOnly;
    },
  });

  Object.defineProperty(accessor, 'value', {
    get: function() {
      return prop.value;
    },
    set: function(value: T) {
      prop.value = value;
    },
  });

  Object.defineProperty(accessor, 'changed', {
    get: function() {
      return prop.changed;
    },
  });

  Object.defineProperty(accessor, 'thrownErrors', {
    get: function() {
      return prop.thrownErrors;
    },
  });

  return accessor;
}

function propertyCompat<T>(
  initialValue?: T,
  source?: Observable<T>,
) {
  return createCompatProperty(propertyFunc(initialValue, source));
}

const toPropertyFunc: <T>(initialValue?: T) => Property<T> = (<any>Observable).prototype.toProperty;
function toPropertyCompat<T>(this: Observable<T>, initialValue?: T) {
  return createCompatProperty(toPropertyFunc.apply(this, [ initialValue ]));
}
(<any>Observable).prototype.toProperty = toPropertyCompat;

export namespace wx {
  export const property = propertyCompat;
  export const command = commandFunc;
  export const whenAny = whenAnyFunc;

  export const isCommand = isCommandFunc;
  export const isProperty = isPropertyFunc;
  export const isObservable = isObservableFunc;
  export const getObservable = getObservableFunc;

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

    return commandFunc(arg1);
  }
}
