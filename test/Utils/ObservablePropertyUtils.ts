import { expect } from 'chai';

import * as wx from 'webrx';

export function TestObservableProperty<T>(property: wx.IObservableProperty<T>, testValue: T): void {
  expect(property.changing).to.exist;
  expect(property.changed).to.exist;

  let changing = false;
  let changed = false;

  property.changing.subscribe(x => {
    expect(changed).to.equal(false);
    changing = true;
  });

  property.changed.subscribe(x => {
    expect(changing).to.equal(true);
    changed = true;
  });

  property(testValue);

  expect(changed).to.equal(true);
  expect(property()).to.equal(testValue);
}

export default TestObservableProperty;
