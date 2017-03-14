import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { Enumerable } from 'ix';
import * as wx from 'webrx';

import { Loading } from '../Common/Loading/Loading';

export function renderEnumerable<T, TResult>(
  source: T[] | Enumerable<T>,
  selector: (data: T[]) => TResult = (data) => data as any as TResult,
  defaultSelector: () => TResult | null = () => null,
) {
  const array = (source instanceof Array) ? source : source.toArray();

  return array.length > 0 ? selector(array) : defaultSelector();
}

export function renderConditional(
  condition: wx.IObservableProperty<boolean> | boolean,
  trueContent: () => any,
  falseContent: () => any = () => null,
) {
  return (typeof condition === 'boolean' ? condition : condition()) ?
    trueContent() :
    falseContent();
}

export function renderNullable<T>(element: T | undefined, notNullContent: (x: T) => any, nullContent?: () => any, constraint?: (x: T) => boolean) {
  return renderConditional(
    element != null && (constraint == null || constraint(element)),
    () => notNullContent(element as T),
    nullContent,
  );
}

export function renderLoadable(
  isLoading: wx.IObservableProperty<boolean> | boolean,
  loadingComponent: any,
  loadedComponent?: any,
) {
  const loadingComponentType = typeof loadingComponent;

  if (loadingComponentType === 'string') {
    const text = loadingComponent;

    loadingComponent = () => (
      <Loading text={ text } />
    );
  }
  else if (loadingComponentType === 'object' && React.isValidElement(loadingComponent) === false) {
    const props = loadingComponent;

    loadingComponent = () => (
      <Loading { ...props } />
    );
  }

  return this.renderConditional(isLoading, loadingComponent, loadedComponent);
}

export function renderSizedLoadable(
  isLoading: wx.IObservableProperty<boolean> | boolean,
  text: string,
  fontSize: number | string,
  loadedComponent?: any,
) {
  return this.renderLoadable(isLoading, {
    text,
    fontSize,
  }, loadedComponent);
}

export function renderGridLoadable(
  isLoading: wx.IObservableProperty<boolean> | boolean,
  text: string,
  fontSize: number | string,
  loadedComponent?: any,
) {
  return this.renderLoadable(isLoading, {
    text,
    fontSize,
    componentClass: Grid,
  }, loadedComponent);
}
