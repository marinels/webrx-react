'use strict';

import { TestObservableProperty } from './TestUtils';

import TestViewModel from '../src/Test/TestViewModel';

describe('Test', () => {
  it('Has an observable firstName property', () => {
    let vm = new TestViewModel();
    TestObservableProperty(vm.firstName, 'asdf');
  });

  it('Has an observable lastName property', () => {
    let vm = new TestViewModel();
    TestObservableProperty(vm.lastName, 'asdf');
  });

  it('Has an observable displayName output property', () => {
    let vm = new TestViewModel();
    vm.initialize();

    vm.firstName('bob');
    vm.lastName('testerson');
    expect(vm.displayName()).toBe('bob testerson');
  })
});

export let Test = 'Test';
