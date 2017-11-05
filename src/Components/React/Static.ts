import { Component, SyntheticEvent } from 'react';
import { Iterable } from 'ix';
import { Observable, Subscription } from 'rxjs';

import {
  bindObservableToCommand, bindEventToProperty, bindEventToCommand,
} from './BindingHelpers';
import {
  renderIterable, renderConditional, renderNullable,
  renderLoadable, renderSizedLoadable, renderGridLoadable,
  focusElement, classNames,
} from './RenderHelpers';
import { BaseViewModel } from './BaseViewModel';
import { Command, Property } from '../../WebRx';
import { ValueComparison } from '../../Utils/Compare';

export function create(target: {} = {}) {
  return {
    bindObservableToCommand,
    bindEventToProperty,
    bindEventToCommand,

    renderIterable,
    renderConditional,
    renderNullable,
    renderLoadable,
    renderSizedLoadable,
    renderGridLoadable,
    focusElement,
    classNames,
  };
}

export const wxr = create();

export type WebRxReactStatic = typeof wxr;

export function inject<T extends {}>(target: T, wxrStatic?: WebRxReactStatic) {
  return Object.assign<T>(target, wxrStatic || wxr);
}
