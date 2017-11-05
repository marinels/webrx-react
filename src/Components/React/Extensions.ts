// tslint:disable:no-shadowed-variable

import * as React from 'react';

import { wx, WebRxStatic } from '../../WebRx';
import { wxr, WebRxReactStatic } from './Static';

declare module 'react' {
  interface Component<P> {
    wx: WebRxStatic;
    wxr: WebRxReactStatic;
  }

  namespace Component {
    let wx: WebRxStatic;
    let wxr: WebRxReactStatic;
  }
}

React.Component.prototype.wx = wx;
React.Component.prototype.wxr = wxr;
React.Component.wx = wx;
React.Component.wxr = wxr;
