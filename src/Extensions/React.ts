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
function restPropsStatic<P, T>(props: P, propsCreator?: (x: P) => T, ...omits: string[]) {
  const result = Object.rest(props, propsCreator, ...omits.concat('key', 'ref', 'className', 'children'));

  return Object.assign<ReactSpreadResult<T>>(result, {
    className: (<React.HTMLAttributes<P>>props).className,
    children: (<any>props).children,
  });
}

function restProps<P, T>(this: React.Component<P>, propsCreator?: (x: P) => T, ...omits: string[]) {
  return restPropsStatic(this.props, propsCreator, ...omits);
}

declare module 'react' {
  interface Component<P> {
    restProps<T>(propsCreator?: (x: P) => T, ...omits: string[]): ReactSpreadResult<T>;
  }

  namespace Component {
    let restProps: typeof restPropsStatic;
  }
}

React.Component.prototype.restProps = restProps;
React.Component.restProps = restPropsStatic;
