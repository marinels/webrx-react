import * as React from 'react';

import './Object';

export interface ReactSpreadResult<T> {
  className: string;
  children: React.ReactNode;
  props: T;
  rest: any;
}

declare module 'react' {
  interface Component<P, S> {
    restProps<T>(propsCreator?: (x: P) => T, ...omits: string[]): ReactSpreadResult<T>;
  }
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
function restProps<P, S, T>(this: React.Component<P, S>, propsCreator?: (x: P) => T, ...omits: string[]) {
  const result = Object.rest(this.props, propsCreator, ...omits.concat('key', 'ref', 'className', 'children'));

  return Object.assign<ReactSpreadResult<T>>(result, {
    className: (<React.HTMLAttributes<P>>this.props).className,
    children: this.props.children,
  });
}

React.Component.prototype.restProps = Object.fallback(React.Component.prototype.restProps, restProps);
