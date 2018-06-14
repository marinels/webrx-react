import * as utils from '../../Utils';
import {
  bindEventToCommand, bindEventToProperty, bindObservableToCommand,
} from './BindingHelpers';
import {
  classNames, focusElement, renderConditional,
  renderIterable, renderNullable,
} from './RenderHelpers';

export function create() {
  return {
    bindObservableToCommand,
    bindEventToProperty,
    bindEventToCommand,

    renderIterable,
    renderConditional,
    renderNullable,
    focusElement,
    classNames,

    utils,
  };
}

export const wxr = create();

export type WebRxReactStatic = typeof wxr;

export function inject<T extends {}>(target: T, wxrStatic?: WebRxReactStatic) {
  return Object.assign(target, wxrStatic || wxr);
}
