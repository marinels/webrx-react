import { Observable } from 'rx';
import * as wx from 'webrx';
import { expect } from 'chai';

describe('Sanity Tests', () => {
  it('Can make assertions', () => {
    expect(true).to.equal(true);
  });

  it('Can access Rx', () => {
    let source = Observable.return(1);
    expect(source).to.exist;
    source.subscribe(x => {
      expect(x).to.equal(1);
    });
  });

  it('Can access wx', () => {
    let prop = wx.property('asdf');
    expect(prop).to.exist;
    expect(prop()).to.equal('asdf');
  });
});
