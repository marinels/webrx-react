'use strict';

import * as Rx from 'rx';
import * as wx from 'webrx';

describe('Sanity Tests', () => {
  it('Can make assertions', () => {
    expect(true).toBe(true);
  });

  it('Can access Rx', () => {
    let source = Rx.Observable.return(1);
    expect(source).toBeDefined();
  });

  it('Can access wx', () => {
    let prop = wx.property('asdf');
    expect(prop).toBeDefined();
    expect(prop()).toBe('asdf');
  });
});
