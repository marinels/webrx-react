import { expect } from 'chai';

import { wx } from '../../src/WebRx';

export function TestObservableProperty<T>(property: wx.IObservableProperty<T>, testValue: T): void {
  expect(property.changed).to.exist;

  let changed = false;

  property.changed.subscribe(x => {
    changed = true;
  });

  property(testValue);

  expect(changed).to.equal(true);
  expect(property()).to.equal(testValue);
}

export default TestObservableProperty;
