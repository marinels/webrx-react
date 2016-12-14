import { IDisposable, Disposable } from 'rx';
import { expect } from 'chai';

import { SubMan } from '../../src/Utils/SubMan';

describe('SubMan', () => {
  describe('constructor', () => {
    it('handles no subscription args', () => {
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as IDisposable[];

      expect(subs).to.be.not.null;
      expect(subs.length).to.equal(0);
    });

    it('handles subscription args', () => {
      let sub = Disposable.create(null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as IDisposable[];

      expect(subs).to.be.not.null;
      expect(subs.length).to.equal(1);
      expect(subs[0]).to.eql(sub);
    });
  });

  describe('add', () => {
    it('handles a single subscription', () => {
      let sub = Disposable.create(null);
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as IDisposable[];

      subman.add(sub);

      expect(subs.length).to.equal(1);
      expect(subs[0]).to.eql(sub);
    });

    it('handles multiple subscriptions', () => {
      let sub1 = Disposable.create(null);
      let sub2 = Disposable.create(null);
      let sub3 = Disposable.create(null);
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as IDisposable[];

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
      let sub = Disposable.create(() => null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as IDisposable[];

      subman.dispose();

      expect(subs.length).to.equal(0);
      expect(sub.isDisposed).to.be.true;
    });
  });
});
