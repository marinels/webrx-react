'use strict';

import * as wx from 'webrx';

// WebRx calls this when in a unit test context
(window as {[key: string]: any})['createMockHistory'] = () => {
  return { onPopState: Rx.Observable.never<PopStateEvent>() };
};

export function TestObservableProperty<T>(property: wx.IObservableProperty<T>, testValue: T): void {
  expect(property.changed).toBeDefined();
  expect(property.changing).toBeDefined();

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

  expect(property()).toBe(testValue);
  expect(changed).toBe(true);
}
