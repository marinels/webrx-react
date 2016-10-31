import * as React from 'react';

import './Object';

declare module 'react' {
  interface Component<P, S> {
    restProps<T>(propsCreator?: (x: P) => T, ...omits: string[]): { rest: any, props: T };
  }
}

// this extension makes 'resting' react props much easier
// i.e.,
// const { rest, props } = this.restProps(x => {
//   const { header, footer } = x;
//   return { header, footer };
// }, 'exclude1', 'exclude2');
// you can additionally choose to omit any properties by name from the rest
// object that is returned (like 'children' for example).
function restProps<P, S, T>(propsCreator?: (x: P) => T, ...omits: string[]) {
  return Object.rest((<React.Component<P, S>>this).props, propsCreator, ...omits.concat('key', 'ref'));
}

React.Component.prototype.restProps = Object.fallback(React.Component.prototype.restProps, restProps);
