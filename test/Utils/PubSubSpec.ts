import { expect } from 'chai';

import { PubSub } from '../../src/Utils/PubSub';

describe('PubSub', () => {
  it('Can subscribe and publish', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    expect(handle).to.exist;
    expect(handle.id).to.equal(1);
    expect(handle.key).to.equal('test');
    pubsub.publish('test');
    expect(called).to.equal(true);
  });

  it('Can publish with no subscribers', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    expect(handle).to.exist;
    pubsub.publish('test2');
    expect(called).to.equal(false);
  });

  it('Can handle anonymous publish args', () => {
    let pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    let handle = pubsub.subscribe('test', (x: {arg1: string, arg2: string}) => { testArg1 = x.arg1; testArg2 = x.arg2; });
    expect(handle).to.exist;
    pubsub.publish('test', {arg1: 'testing'});
    expect(testArg1).to.exist;
    expect(testArg2).to.be.undefined;
    expect(testArg1).to.equal('testing');
    pubsub.publish('test', {arg1: 'testing1', arg2: 'testing2'});
    expect(testArg2).to.exist;
    expect(testArg1).to.equal('testing1');
    expect(testArg2).to.equal('testing2');
  });

  it('Can handle strongly typed publish args', () => {
    interface TestArgs {
      arg1: string;
      arg2: string;
    }
    let pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    let handle = pubsub.subscribe<TestArgs>('test', x => { testArg1 = x.arg1; testArg2 = x.arg2; });
    expect(handle).to.exist;
    pubsub.publish('test', <TestArgs>{ arg1: 'testing' });
    expect(testArg1).to.exist;
    expect(testArg2).to.be.undefined;
    expect(testArg1).to.equal('testing');
    pubsub.publish('test', <TestArgs>{arg1: 'testing1', arg2: 'testing2'});
    expect(testArg2).to.exist;
    expect(testArg1).to.equal('testing1');
    expect(testArg2).to.equal('testing2');
  });

  it('Can unsubscribe', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    pubsub.unsubscribe(handle);
    pubsub.publish('test');
    expect(called).to.equal(false);
  });

  it('Can handle multiple subscriptions on the same key', () => {
    let pubsub = new PubSub();
    let called1 = false, called2 = false;
    let handle1 = pubsub.subscribe('test', x => called1 = true);
    let handle2 = pubsub.subscribe('test', x => called2 = true);
    expect(handle1).to.exist;
    expect(handle2).to.exist;
    pubsub.publish('test');
    expect(called1).to.equal(true);
    expect(called2).to.equal(true);
  });

  it('Can unsubscribe from a single handle with multiple subscriptions on the same key', () => {
    let pubsub = new PubSub();
    let called1 = false, called2 = false;
    let handle1 = pubsub.subscribe('test', x => called1 = true);
    let handle2 = pubsub.subscribe('test', x => called2 = true);
    expect(handle1).to.exist;
    expect(handle2).to.exist;
    pubsub.unsubscribe(handle1);
    pubsub.publish('test');
    expect(called1).to.equal(false);
    expect(called2).to.equal(true);
  });
});
