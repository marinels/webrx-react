// tslint:disable:no-shadowed-variable

import * as React from 'react';
import { Iterable } from 'ix';

import { RestResult } from './Object';

export function trimPropsStatic<T>(props: T): T {
  return Object.trim(props, false);
}

export interface ReactSpreadResultProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ReactSpreadRestrictedProps extends ReactSpreadResultProps {
  key?: React.Key;
  ref?: React.Ref<any>;
}

export interface ReactSpreadResult<P, T, R extends ReactSpreadRestrictedProps> extends RestResult<P, T, R>, ReactSpreadResultProps {
}

export const reactRestrictedProps: ReactSpreadRestrictedProps = {
  key: undefined,
  ref: undefined,
  className: undefined,
  children: undefined,
};

// this extension makes 'resting' React props much easier
// i.e.,
// const { className, children, props, rest } = this.restProps(x => {
//   const { header, footer } = x;
//   return { header, footer };
// }, 'exclude1', 'exclude2');
// You may omit any of the className, children, props, or rest props from the return value
// you may additionally choose to omit any properties by name from the rest
// object that is returned (like 'children' for example).
export function restPropsStatic<P, T, R extends ReactSpreadRestrictedProps = ReactSpreadRestrictedProps>(
  props: P,
  propsCreator?: (x: P) => T,
  restrictedProps?: R,
): ReactSpreadResult<P, T, R> {
  if (restrictedProps == null) {
    restrictedProps = <R>reactRestrictedProps;
  }

  const result = Object.rest(props, propsCreator, restrictedProps);

  return {
    className: result.removals.className,
    children: result.removals.children,
    props: result.props,
    rest: result.rest,
    removals: result.removals,
  };
}

export function restProps<P, T, R extends ReactSpreadRestrictedProps = ReactSpreadRestrictedProps>(
  this: React.Component<P>,
  propsCreator?: (x: P) => T,
  restrictedProps?: R,
): ReactSpreadResult<P, T, R> {
  return restPropsStatic(this.props, propsCreator, restrictedProps);
}

declare module 'react' {
  interface Component<P> {
    // sadly, we need to re-define this restProps function here instead of using
    // the normal restProps: typeof restProps
    // this is because a function property cannot be overridden in a derived class
    restProps<T, R extends ReactSpreadRestrictedProps = ReactSpreadRestrictedProps>(
      propsCreator?: (x: P) => T,
      restrictedProps?: R,
    ): ReactSpreadResult<P, T, R>;
  }

  namespace Component {
    let trimProps: typeof trimPropsStatic;
    let restProps: typeof restPropsStatic;
  }
}

React.Component.prototype.restProps = restProps;
React.Component.trimProps = trimPropsStatic;
React.Component.restProps = restPropsStatic;
