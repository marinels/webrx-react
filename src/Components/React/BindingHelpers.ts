import * as React from 'react';
import { Subscription } from 'rxjs';

import { Command, getObservable, isCommand, ObservableLike, Property } from '../../WebRx';
import { BaseViewModel } from './BaseViewModel';

/**
 * Binds an observable to a command on the view model
 */
export function bindObservableToCommand<TViewModel extends BaseViewModel, TInput, TResult>(
  viewModel: Readonly<TViewModel>,
  observableLike: ObservableLike<TInput>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<TResult>,
  onNext?: (value: TInput) => void,
  onError?: (exception: any) => void,
  onCompleted?: () => void,
): Subscription {
  return (viewModel as TViewModel).addSubscription(
    getObservable(observableLike)
      .invokeCommand(commandSelector(viewModel), onNext, onError, onCompleted),
  );
}

/**
 * Binds a DOM event to an observable property on the view model
 */
export function bindEventToProperty<
  TViewModel extends BaseViewModel,
  TValue,
  TEvent extends Event | React.SyntheticEvent<any>,
>(
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
export function bindEventToCommand<
  TViewModel extends BaseViewModel,
  TParameter,
  TCommand,
  TEvent extends Event | React.SyntheticEvent<any>,
>(
  viewModel: Readonly<TViewModel>,
  commandSelector: (viewModel: Readonly<TViewModel>) => Command<TCommand>,
  paramSelector?: (eventKey: any, event: TEvent) => TParameter,
  conditionSelector?: (event: TEvent, eventKey: any) => boolean,
  onNext?: (value: TCommand) => void,
  onError?: (exception: any) => void,
  onCompleted?: () => void,
): any { // this needs to be any instead of Function to support React.EventHandler<T>
  return (eventKey: any, event: TEvent) => {
    // this ensures that we can still use this function for basic HTML events
    event = event || eventKey;

    const param: TParameter = (paramSelector == null ? eventKey : paramSelector(eventKey, event));
    const canExecute = conditionSelector == null || conditionSelector(event, eventKey);

    if (canExecute) {
      const cmd = commandSelector(viewModel);

      if (isCommand(cmd)) {
        cmd.execute(param, onNext, onError, onCompleted);
      }
    }
  };
}
