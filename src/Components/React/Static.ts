import {
  bindObservableToCommand, bindEventToProperty, bindEventToCommand,
} from './BindingHelpers';
import {
  renderIterable, renderConditional, renderNullable,
  renderLoadable, renderSizedLoadable, renderGridLoadable,
  focusElement, classNames,
} from './RenderHelpers';

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
