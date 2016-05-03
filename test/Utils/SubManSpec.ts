'use strict';

import { expect } from 'chai';

import * as Rx from 'rx';

import { SubMan } from '../../src/Utils/SubMan';

describe('SubMan', () => {
  describe('constructor', () => {
    it('handles no subscription args', () => {
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as Rx.IDisposable[];

      expect(subs).to.be.not.null;
      expect(subs.length).to.equal(0);
    });

    it('handles subscription args', () => {
      let sub = Rx.Disposable.create(null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as Rx.IDisposable[];

      expect(subs).to.be.not.null;
      expect(subs.length).to.equal(1);
      expect(subs[0]).to.eql(sub);
    });
  });

  describe('add', () => {
    it('handles a single subscription', () => {
      let sub = Rx.Disposable.create(null);
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as Rx.IDisposable[];

      subman.add(sub);

      expect(subs.length).to.equal(1);
      expect(subs[0]).to.eql(sub);
    });

    it('handles multiple subscriptions', () => {
      let sub1 = Rx.Disposable.create(null);
      let sub2 = Rx.Disposable.create(null);
      let sub3 = Rx.Disposable.create(null);
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as Rx.IDisposable[];

      subman.add(sub1);
      subman.add(sub2);
      subman.add(sub3);

      expect(subs.length).to.equal(3);
      expect(subs[0]).to.eql(sub1);
      expect(subs[1]).to.eql(sub2);
      expect(subs[2]).to.eql(sub3);
    });
  });

  describe('dispose', () => {
    it('disposes subscriptions and empties the list', () => {
      let sub = Rx.Disposable.create(() => null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as Rx.IDisposable[];

      subman.dispose();

      expect(subs.length).to.equal(0);
      expect(sub.isDisposed).to.be.true;
    });
  });
});
