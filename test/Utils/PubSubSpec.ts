'use strict';

import { PubSub } from '../../src/Utils/PubSub';

describe('PubSub', () => {
  it('can subscribe and publish', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    expect(handle).toBeDefined();
    expect(handle.id).toBe(1);
    expect(handle.key).toBe('test');
    pubsub.publish('test');
    expect(called).toBe(true);
  })

  it('can publish with no subscribers', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    pubsub.publish('test2');
    expect(called).toBe(false);
  })

  it('can handle anonymous publish args', () => {
    let pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    let handle = pubsub.subscribe('test', (x: {arg1: string, arg2: string}) => { testArg1 = x.arg1; testArg2 = x.arg2; });
    pubsub.publish('test', {arg1: 'testing'});
    expect(testArg1).toBeDefined();
    expect(testArg2).toBeUndefined();
    expect(testArg1).toBe('testing');
    pubsub.publish('test', {arg1: 'testing1', arg2: 'testing2'});
    expect(testArg2).toBeDefined();
    expect(testArg1).toBe('testing1');
    expect(testArg2).toBe('testing2');
  });

  it('can handle strongly typed publish args', () => {
    interface ITestArgs {
      arg1: string;
      arg2: string;
    }
    let pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    let handle = pubsub.subscribe<ITestArgs>('test', x => { testArg1 = x.arg1; testArg2 = x.arg2; });
    pubsub.publish('test', <ITestArgs>{ arg1: 'testing' });
    expect(testArg1).toBeDefined();
    expect(testArg2).toBeUndefined();
    expect(testArg1).toBe('testing');
    pubsub.publish('test', <ITestArgs>{arg1: 'testing1', arg2: 'testing2'});
    expect(testArg2).toBeDefined();
    expect(testArg1).toBe('testing1');
    expect(testArg2).toBe('testing2');
  });

  it('can unsubscribe', () => {
    let pubsub = new PubSub();
    let called = false;
    let handle = pubsub.subscribe('test', x => called = true);
    pubsub.unsubscribe(handle);
    pubsub.publish('test');
    expect(called).toBe(false);
  })

  it('can handle multiple subscriptions on the same key', () => {
    let pubsub = new PubSub();
    let called1 = false, called2 = false;
    let handle1 = pubsub.subscribe('test', x => called1 = true);
    let handle2 = pubsub.subscribe('test', x => called2 = true);
    pubsub.publish('test');
    expect(called1).toBe(true);
    expect(called2).toBe(true);
  });

  it('can unsubscribe from a single handle with multiple subscriptions on the same key', () => {
    let pubsub = new PubSub();
    let called1 = false, called2 = false;
    let handle1 = pubsub.subscribe('test', x => called1 = true);
    let handle2 = pubsub.subscribe('test', x => called2 = true);
    pubsub.unsubscribe(handle1);
    pubsub.publish('test');
    expect(called1).toBe(false);
    expect(called2).toBe(true);
  });
});
