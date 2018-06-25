import * as classNamesFunc from 'classnames';
import { Iterable } from 'ix';
import * as React from 'react';
import { findDOMNode } from 'react-dom';

import { ValueComparer, ValueComparison } from '../../Utils/Compare';
import { IterableLike, Property } from '../../WebRx';

export function renderIterable<T>(
  source: IterableLike<T> | undefined,
  selector: (item: T, index: number, items: T[]) => React.ReactNode = item =>
    item,
  projector: (items: React.ReactNode[]) => React.ReactNode = items => items,
  sortKey?: (item: T) => any,
  sortComparer: ValueComparison<T> = ValueComparer.DefaultComparison,
  defaultSelector: () => T | undefined = () => undefined,
) {
  if (source == null) {
    return projector([]);
  }

  let iterable = Iterable.from(source);

  if (sortKey != null) {
    iterable = iterable.orderBy(sortKey, sortComparer);
  }

  return projector(
    iterable
      .defaultIfEmpty(defaultSelector())
      .filterNull()
      .toArray()
      .map((x, i, a) => selector(x, i, a)),
  );
}

export function renderConditional(
  condition: Property<boolean> | boolean | undefined | null,
  trueContent: () => React.ReactNode,
  falseContent: () => React.ReactNode = () => false,
) {
  return (condition == null
  ? false
  : typeof condition === 'boolean'
    ? condition
    : condition.value)
    ? trueContent()
    : falseContent();
}

export function renderNullable<T>(
  item: T | undefined | null,
  notNullContent: (x: T) => React.ReactNode,
  nullContent?: () => React.ReactNode,
  constraint?: (x: T) => boolean,
) {
  return renderConditional(
    item != null && (constraint == null || constraint(item)),
    () => notNullContent(item as T),
    nullContent,
  );
}

// focus the provided element (if it is focusable) and optionally perform an action on that element after focus
export function focusElement<T extends HTMLElement = HTMLElement>(
  instance: React.ReactInstance | null | undefined,
  action?: (elem: T) => void,
) {
  if (instance) {
    const elem = findDOMNode(instance) as T;

    if (elem && elem.focus instanceof Function) {
      elem.focus();

      if (action) {
        action(elem);
      }
    }
  }
}

// classNames type defs don't export the internal types so we have to decouple here
export function classNames(...args: any[]): string {
  return classNamesFunc.apply(this, arguments);
}
