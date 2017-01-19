import { Observable, BehaviorSubject, TestScheduler } from 'rx';
import * as wx from 'webrx';

import { should, sandbox } from './setup';

describe('Sanity Tests', () => {
  describe('for mocha', () => {
    it('can create a test with describe and it', () => {
      // intentionally empty
    });
  });

  describe('for chai', () => {
    it('can use should.equal to assert', () => {
      should.equal(true, true);
    });

    it('can use should extensions to assert', () => {
      true.should.eql(true);
    });
  });

  describe('for sinon', () => {
    it('can create stubs', () => {
      const stub = sandbox.stub();

      should.exist(stub);
      should.exist(stub.callCount);

      stub('test');

      stub.callCount.should.eql(1);
      stub.firstCall.args.should.eql([ 'test' ]);
    });

    it('can create spys', () => {
      const obj = {
        fn: function(arg: string) {
          return arg;
        },
      };
      const spy = sandbox.spy(obj, 'fn');

      const result = obj.fn('test');

      spy.callCount.should.eql(1);
      spy.firstCall.args.should.eql([ 'test' ]);
      should.exist(result);
      result.should.eql('test');
    });
  });

  describe('for sinon-chai', () => {
    it('can assert stubs', () => {
      const stub = sandbox.stub();

      stub('test');

      stub.should.have.been.calledOnce;
      stub.should.have.been.calledWith('test');
    });

    it('can assert spys', () => {
      const spy = sandbox.spy();

      spy('test');

      spy.should.have.been.calledOnce;
      spy.should.have.been.calledWith('test');
    });
  });

  describe('for Rx', () => {
    it('Can access Rx', () => {
      const source = Observable.return(1);

      should.exist(source);
      source.subscribe(x => {
        should.exist(x);
        x.should.eql(1);
      });
    });

    it('can schedule observables', () => {
      const result = new BehaviorSubject(0);
      const scheduler = new TestScheduler();

      Observable.of(1).observeOn(scheduler).subscribe(result);
      result.getValue().should.eql(0);

      scheduler.advanceBy(1);
      result.getValue().should.eql(1);
    });

    it('can simulate time for long running observables', (done) => {
      const timer = sandbox.useFakeTimers();

      Observable
        .interval(5000)
        .take(1)
        .subscribe(() => done());

      timer.tick(6000);
    });
  });

  describe('for webrx', () => {
    it('Can access wx', () => {
      const prop = wx.property('test');

      should.exist(prop);
      should.exist(prop());
      prop().should.eql('test');
    });
  });
});
