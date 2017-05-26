import * as React from 'react';
import { IDisposable } from 'rx';

import { ObservableOrProperty, Property, Command } from '../../WebRx';
import { BaseViewModel } from './BaseViewModel';

/**
 * Binds an observable to a command on the view model
 */
export function bindObservableToCommand<TViewModel extends BaseViewModel, TInput, TResult>(
  viewModel: Readonly<TViewModel>,
  observable: ObservableOrProperty<TInput>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<TResult>,
) {
  return viewModel.bindObservable(observable, x => x.invokeCommand(commandSelector(viewModel)));
}

/**
 * Binds a DOM event to an observable property on the view model
 */
export function bindEventToProperty<TViewModel extends BaseViewModel, TValue, TEvent extends Event | React.SyntheticEvent<any>>(
  thisArg: any,
  viewModel: Readonly<TViewModel>,
  targetSelector: (viewModel: Readonly<TViewModel>) => Property<TValue>,
  valueSelector?: (eventKey: any, event: TEvent) => TValue,
): any { // this needs to be any instead of Function to support React.EventHandler<T>
  return (eventKey: any, event: TEvent) => {
    // this ensures that we can still use this function for basic HTML events
    event = event || eventKey;

    const prop = targetSelector.apply(thisArg, [ viewModel ]) as Property<TValue>;
    const value = (valueSelector == null ? eventKey : valueSelector.apply(thisArg, [ eventKey, event ])) as TValue;

    prop.value = value;
  };
}

/**
 * Binds a DOM event to an observable command on the view model
 */
export function bindEventToCommand<TViewModel extends BaseViewModel, TParameter, TEvent extends Event | React.SyntheticEvent<any>>(
  thisArg: any,
  viewModel: Readonly<TViewModel>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<any>,
  paramSelector?: (eventKey: any, event: TEvent) => TParameter,
  conditionSelector?: (event: TEvent, eventKey: any) => boolean,
): any { // this needs to be any instead of Function to support React.EventHandler<T>
  return (eventKey: any, event: TEvent) => {
    // this ensures that we can still use this function for basic HTML events
    event = event || eventKey;

    const param = (paramSelector == null ? eventKey : paramSelector.apply(thisArg, [ eventKey, event ])) as TParameter;
    const canExecute = conditionSelector == null || (conditionSelector.apply(thisArg, [ event, eventKey ]) as boolean);

    if (canExecute) {
      const cmd = commandSelector.apply(thisArg, [ viewModel ]) as Command<any>;

      cmd.execute(param);
    }
  };
}
