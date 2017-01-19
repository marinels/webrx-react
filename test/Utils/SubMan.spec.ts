import { should } from '../setup';
import { IDisposable, Disposable } from 'rx';
import { SubMan } from '../../src/Utils/SubMan';

describe('SubMan', () => {
  describe('constructor', () => {
    it('handles no subscription args', () => {
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as IDisposable[];

      should.exist(subs);
      subs.length.should.eql(0);
    });

    it('handles subscription args', () => {
      let sub = Disposable.create(null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as IDisposable[];

      should.exist(subs);
      subs.length.should.eql(1);
      subs[0].should.eql(sub);
    });
  });

  describe('add', () => {
    it('handles a single subscription', () => {
      let sub = Disposable.create(null);
      let subman = new SubMan();
      let subs = (<any>subman).subscriptions as IDisposable[];

      subman.add(sub);

      subs.length.should.eql(1);
      subs[0].should.eql(sub);
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

      subs.length.should.eql(3);
      subs[0].should.eql(sub1);
      subs[1].should.eql(sub2);
      subs[2].should.eql(sub3);
    });
  });

  describe('dispose', () => {
    it('disposes subscriptions and empties the list', () => {
      let sub = Disposable.create(() => null);
      let subman = new SubMan(sub);
      let subs = (<any>subman).subscriptions as IDisposable[];

      subman.dispose();

      subs.length.should.eql(0);
      sub.isDisposed.should.be.true;
    });
  });
});
