// tslint:disable:no-shadowed-variable

import * as React from 'react';

export interface ReactSpreadResult<T> {
  className: string;
  children: React.ReactNode;
  props: T;
  rest: any;
}

// this extension makes 'resting' React props much easier
// i.e.,
// const { className, children, props, rest } = this.restProps(x => {
//   const { header, footer } = x;
//   return { header, footer };
// }, 'exclude1', 'exclude2');
// You may omit any of the className, children, props, or rest props from the return value
// you may additionally choose to omit any properties by name from the rest
// object that is returned (like 'children' for example).
export function restPropsStatic<P, T>(
  props: P,
  propsCreator?: (x: P) => T,
  ...omits: string[],
): ReactSpreadResult<T> {
  const result = Object.rest(<Partial<React.HTMLAttributes<P>>>props, propsCreator, ...omits.concat('key', 'ref', 'className', 'children'));
  const htmlProps: Partial<React.HTMLAttributes<P>> = props;

  return Object.assign<ReactSpreadResult<T>>(result, {
    className: htmlProps.className,
    children: htmlProps.children,
  });
}

export function restProps<P, T>(
  this: React.Component<P>,
  propsCreator?: (x: P) => T,
  ...omits: string[],
): ReactSpreadResult<T> {
  return restPropsStatic(this.props, propsCreator, ...omits);
}

declare module 'react' {
  interface Component<P> {
    // sadly, we need to re-define this restProps function here instead of using
    // the normal restProps: typeof restProps
    // this is because a function property cannot be overridden in a derived class
    restProps<T>(
      propsCreator?: (x: P) => T,
      ...omits: string[],
    ): ReactSpreadResult<T>;
  }

  namespace Component {
    let restProps: typeof restPropsStatic;
  }
}

React.Component.prototype.restProps = restProps;
React.Component.restProps = restPropsStatic;
