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

  it('can handle publish args', () => {
    let pubsub = new PubSub();
    let testArg1: any;
    let testArg2: any;
    let handle = pubsub.subscribe('test', (x: any[]) => { testArg1 = x[0]; testArg2 = x[1]; });
    pubsub.publish('test', 'testing');
    expect(testArg1).toBeDefined();
    expect(testArg2).toBeUndefined();
    expect(testArg1).toBe('testing');
    pubsub.publish('test', 'testing1', 'testing2');
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
