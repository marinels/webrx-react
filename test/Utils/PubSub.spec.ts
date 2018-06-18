import { Subscription } from 'rxjs';

import { PubSub } from '../../src/Utils/PubSub';
import { should } from '../setup';

describe('PubSub', () => {
  it('Can subscribe and publish', () => {
    const pubsub = new PubSub();
    let called = false;
    const handle = pubsub.subscribe('test', () => (called = true));
    should.exist(handle);
    handle.should.be.instanceOf(Subscription);
    pubsub.publish('test', undefined);
    called.should.be.true;
  });

  it('Can publish with no subscribers', () => {
    const pubsub = new PubSub();
    pubsub.publish('test2', undefined);
  });

  it('Can publish on a different key with no subscribers', () => {
    const pubsub = new PubSub();
    let called = false;
    const handle = pubsub.subscribe('test', () => (called = true));
    should.exist(handle);
    pubsub.publish('test2', undefined);
    called.should.eql(false);
  });

  it('Can handle anonymous publish args', () => {
    const pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    const handle = pubsub.subscribe(
      'test',
      (x: { arg1: string; arg2: string }) => {
        testArg1 = x.arg1;
        testArg2 = x.arg2;
      },
    );
    should.exist(handle);
    pubsub.publish('test', { arg1: 'testing' });
    should.exist(testArg1);
    should.not.exist(testArg2);
    testArg1.should.eql('testing');
    pubsub.publish('test', { arg1: 'testing1', arg2: 'testing2' });
    should.exist(testArg2);
    testArg1.should.eql('testing1');
    testArg2.should.eql('testing2');
  });

  it('Can handle strongly typed publish args', () => {
    interface TestArgs {
      arg1: string;
      arg2: string;
    }
    const pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    const handle = pubsub.subscribe<TestArgs>('test', x => {
      testArg1 = x.arg1;
      testArg2 = x.arg2;
    });
    should.exist(handle);
    pubsub.publish('test', { arg1: 'testing' } as TestArgs);
    should.exist(testArg1);
    should.not.exist(testArg2);
    testArg1.should.eql('testing');
    pubsub.publish('test', { arg1: 'testing1', arg2: 'testing2' } as TestArgs);
    should.exist(testArg2);
    testArg1.should.eql('testing1');
    testArg2.should.eql('testing2');
  });

  it('Can unsubscribe', () => {
    const pubsub = new PubSub();
    let called = false;
    const handle = pubsub.subscribe('test', () => (called = true));
    handle.unsubscribe();
    pubsub.publish('test', undefined);
    called.should.eql(false);
  });

  it('Can handle multiple subscriptions on the same key', () => {
    const pubsub = new PubSub();
    let called1 = false;
    let called2 = false;
    const handle1 = pubsub.subscribe('test', () => (called1 = true));
    const handle2 = pubsub.subscribe('test', () => (called2 = true));
    should.exist(handle1);
    should.exist(handle2);
    pubsub.publish('test', undefined);
    called1.should.eql(true);
    called2.should.eql(true);
  });

  it('Can unsubscribe from a single handle with multiple subscriptions on the same key', () => {
    const pubsub = new PubSub();
    let called1 = false;
    let called2 = false;
    const handle1 = pubsub.subscribe('test', () => (called1 = true));
    const handle2 = pubsub.subscribe('test', () => (called2 = true));
    should.exist(handle1);
    should.exist(handle2);
    handle1.unsubscribe();
    pubsub.publish('test', undefined);
    called1.should.eql(false);
    called2.should.eql(true);
  });
});
