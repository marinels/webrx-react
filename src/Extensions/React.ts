import * as React from 'react';

import './Object';

interface ReactSpread<T> {
  className: string;
  props: T;
  rest: any;
}

declare module 'react' {
  interface Component<P, S> {
    restProps<T>(propsCreator?: (x: P) => T, ...omits: string[]): ReactSpread<T>;
  }
}

// this extension makes 'resting' React props much easier
// i.e.,
// const { className, props, rest } = this.restProps(x => {
//   const { header, footer } = x;
//   return { header, footer };
// }, 'exclude1', 'exclude2');
// You may omit any of the className, props, or rest props from the return value
// you may additionally choose to omit any properties by name from the rest
// object that is returned (like 'children' for example).
function restProps<P, S, T>(propsCreator?: (x: P) => T, ...omits: string[]) {
  const props = (<React.Component<P, S>>this).props;
  const result = Object.rest(props, propsCreator, ...omits.concat('key', 'ref', 'className'));

  return Object.assign<ReactSpread<T>>(result, { className: (<React.HTMLAttributes>props).className });
}

React.Component.prototype.restProps = Object.fallback(React.Component.prototype.restProps, restProps);
