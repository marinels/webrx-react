import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { Iterable } from 'ix';
import * as classNamesFunc from 'classnames';

import { Property, IterableLike } from '../../WebRx';
import { ValueComparison, ValueComparer } from '../../Utils/Compare';

export function renderIterable<T>(
  source: IterableLike<T> | undefined,
  selector: (item: T, index: number, items: Array<T>) => React.ReactNode = item => item,
  projector: (items: Array<React.ReactNode>) => React.ReactNode = items => items,
  sortKey?: (item: T) => any,
  sortComparer: ValueComparison<T> = ValueComparer.DefaultComparison,
  defaultSelector: () => T | undefined = () => undefined,
) {
  if (source == null) {
    return projector([]);
  }

  let iterable = Iterable.from(source);

  if (sortKey != null) {
    iterable = iterable
      .orderBy(sortKey, sortComparer);
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
  return (condition == null ? false : (typeof condition === 'boolean' ? condition : condition.value)) ?
    trueContent() :
    falseContent();
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

/**
 * Focus a react instance upon mounting
 * i.e., <Elem ref={ (x: React.ReactInstance) => this.focusElement(x) } />
 */
export function focusElement<T extends HTMLElement = HTMLElement>(
  instance: React.ReactInstance | undefined | null,
) {
  const elem = instance == null ? undefined : findDOMNode(instance) as T;

  if (elem != null) {
    if (elem.focus instanceof Function) {
      elem.focus();
    }

    return elem;
  }

  return undefined;
}

// classNames type defs don't export the internal types so we have to decouple here
export function classNames(...args: any[]): string {
  return classNamesFunc.apply(this, arguments);
}
