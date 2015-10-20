'use strict';

import * as wx from 'webrx';

export function TestObservableProperty<T>(property: wx.IObservableProperty<T>, testValue: T): void {
  expect(property.changing).toBeDefined();
  expect(property.changed).toBeDefined();

  let changing = false;
  let changed = false;

  property.changing.subscribe(x => {
    expect(changed).toBe(false);
    changing = true;
  });

  property.changed.subscribe(x => {
    expect(changing).toBe(true);
    changed = true;
  });

  property(testValue);

  expect(changed).toBe(true);
  expect(property()).toBe(testValue);
}

export default TestObservableProperty;
