import { Observable, BehaviorSubject, TestScheduler } from 'rxjs';

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
      const source = Observable.of(1);

      should.exist(source);
      source.subscribe(x => {
        should.exist(x);
        x.should.eql(1);
      });
    });

    it('can defer processing an observable value using the TestScheduler', () => {
      const result = new BehaviorSubject(0);
      const scheduler = new TestScheduler((a, b) => a === b);

      Observable
        .of(1)
        .observeOn(scheduler)
        .subscribe(result);
      result.value.should.eql(0);

      scheduler.flush();
      result.value.should.eql(1);
    });

    it('can defer processing multiple observable values using the TestScheduler', () => {
      const source = new BehaviorSubject(0);
      const result = new BehaviorSubject(0);
      const scheduler = new TestScheduler((a, b) => a === b);

      source
        .observeOn(scheduler)
        .subscribe(result);
      result.value.should.eql(0);

      source.next(1);
      source.next(2);
      source.next(3);
      result.value.should.eql(0);

      scheduler.flush();
      result.value.should.eql(source.value);
    });

    it('can use the TestScheduler to pause midway through an observable', () => {
      const result = new BehaviorSubject('0');
      const scheduler = new TestScheduler((a, b) => a === b);

      scheduler
        .createColdObservable('-1-2-3-|')
        .subscribe(result);

      scheduler.frame.should.eql(0);
      result.value.should.eql('0', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(9);
      scheduler.frame.should.eql(9);
      result.value.should.eql('0', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(10);
      scheduler.frame.should.eql(10);
      result.value.should.eql('1', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(29);
      scheduler.frame.should.eql(29);
      result.value.should.eql('1', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(50);
      scheduler.frame.should.eql(50);
      result.value.should.eql('3', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(70);
      scheduler.frame.should.eql(70);
      result.value.should.eql('3', `frame ${ scheduler.frame }`);

      scheduler.advancedTo(1000);
      scheduler.frame.should.eql(1000);
      result.value.should.eql('3', `frame ${ scheduler.frame }`);
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
});
