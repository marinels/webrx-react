import * as React from 'react';
import { Subscription } from 'rxjs';

import { ObservableOrProperty, Property, Command, isCommand, getObservable } from '../../WebRx';
import { BaseViewModel } from './BaseViewModel';

/**
 * Binds an observable to a command on the view model
 */
export function bindObservableToCommand<TViewModel extends BaseViewModel, TInput, TResult>(
  viewModel: Readonly<TViewModel>,
  observableOrProperty: ObservableOrProperty<TInput>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<TResult>,
): Subscription {
  return viewModel.addSubscription(getObservable(observableOrProperty).invokeCommand(commandSelector(viewModel)));
}

/**
 * Binds a DOM event to an observable property on the view model
 */
export function bindEventToProperty<TViewModel extends BaseViewModel, TValue, TEvent extends Event | React.SyntheticEvent<any>>(
  viewModel: Readonly<TViewModel>,
  targetSelector: (viewModel: Readonly<TViewModel>) => Property<TValue>,
  valueSelector?: (eventKey: any, event: TEvent) => TValue,
): any { // this needs to be any instead of Function to support React.EventHandler<T>
  return (eventKey: any, event: TEvent) => {
    // this ensures that we can still use this function for basic HTML events
    event = event || eventKey;

    const prop = targetSelector(viewModel);
    const value: TValue = (valueSelector == null ? eventKey : valueSelector(eventKey, event));

    prop.value = value;
  };
}

/**
 * Binds a DOM event to an observable command on the view model
 */
export function bindEventToCommand<TViewModel extends BaseViewModel, TParameter, TEvent extends Event | React.SyntheticEvent<any>>(
  viewModel: Readonly<TViewModel>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<any>,
  paramSelector?: (eventKey: any, event: TEvent) => TParameter,
  conditionSelector?: (event: TEvent, eventKey: any) => boolean,
): any { // this needs to be any instead of Function to support React.EventHandler<T>
  return (eventKey: any, event: TEvent) => {
    // this ensures that we can still use this function for basic HTML events
    event = event || eventKey;

    const param: TParameter = (paramSelector == null ? eventKey : paramSelector(eventKey, event));
    const canExecute = conditionSelector == null || conditionSelector(event, eventKey);

    if (canExecute) {
      const cmd = commandSelector(viewModel);

      if (isCommand(cmd)) {
        cmd.execute(param);
      }
    }
  };
}
