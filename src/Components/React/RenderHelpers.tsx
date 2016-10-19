import * as React from 'react';

import * as wx from 'webrx';
import { Loading } from '../Common/Loading/Loading';

export function renderEnumerable<T, TResult>(
  source: T[] | Ix.Enumerable<T>,
  selector: (data: T[]) => TResult = (data) => data as any as TResult,
  defaultSelector: () => TResult = () => null as TResult
) {
  const array = (source instanceof Array) ? source : source.toArray();

  return array.length > 0 ? selector(array) : defaultSelector();
}

export function renderConditional(
  condition: wx.IObservableProperty<boolean> | boolean,
  trueContent: any,
  falseContent?: any
) {
  return (condition instanceof Function ? condition() : condition) === true ?
    (trueContent instanceof Function ? trueContent.apply(this) : trueContent) :
    (falseContent instanceof Function ? falseContent.apply(this) : falseContent);
}

export function renderLoadable(
  isLoading: wx.IObservableProperty<boolean> | boolean,
  loadingComponent: any,
  loadedComponent?: any
) {
  const loadingComponentType = typeof loadingComponent;

  if (loadingComponentType === 'string') {
    loadingComponent = (
      <Loading text={loadingComponent} />
    );
  }
  else if (loadingComponentType === 'object' && React.isValidElement(loadingComponent) === false) {
    loadingComponent = (
      <Loading {...loadingComponent} />
    );
  }

  return this.renderConditional(isLoading, loadingComponent, loadedComponent);
}

export function renderSizedLoadable(
  isLoading: wx.IObservableProperty<boolean> | boolean,
  text: string,
  fontSize: number | string,
  loadedComponent?: any
) {
  return this.renderLoadable(isLoading, {
    text,
    fontSize,
  }, loadedComponent);
}
