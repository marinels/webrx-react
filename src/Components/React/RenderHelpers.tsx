import * as React from 'react';
import { Grid } from 'react-bootstrap';
import { Enumerable } from 'ix';
import * as wx from 'webrx';

import { Loading } from '../Common/Loading/Loading';

export function renderEnumerable<T, TResult>(
  source: T[] | Enumerable<T>,
  selector: (data: T[]) => TResult = (data) => data as any as TResult,
  defaultSelector: () => TResult = () => null as TResult,
) {
  const array = (source instanceof Array) ? source : source.toArray();

  return array.length > 0 ? selector(array) : defaultSelector();
}

export function renderConditional(
  condition: wx.IObservableProperty<boolean> | boolean,
  trueContent: any,
  falseContent: any = null,
  warnStaticContent = false,
) {
  // allow build to override default value
  if (DEBUG) {
    warnStaticContent = true;
  }

  // if either provided content is static warn that
  if (warnStaticContent) {
    // tslint:disable no-console
    if (trueContent != null && (typeof trueContent === 'object')  && (trueContent instanceof Function) === false) {
      console.warn('renderConditional using static trueContent, use a lambda instead');
    }

    if (falseContent != null && (typeof falseContent === 'object') && (falseContent instanceof Function) === false) {
      console.warn('renderConditional using static falseContent, use a lambda instead');
    }
    // tslint:enable no-console
  }

  return (condition instanceof Function ? condition() : condition) === true ?
    (trueContent instanceof Function ? trueContent.apply(this) : trueContent) :
    (falseContent instanceof Function ? falseContent.apply(this) : falseContent);
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
