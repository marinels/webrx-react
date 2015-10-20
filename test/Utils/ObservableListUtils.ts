'use strict';

import * as wx from 'webrx';

export function TestObservableList<T>(list: wx.IObservableList<T>, testValue: T): void {
  expect(list.listChanging).toBeDefined();
  expect(list.listChanged).toBeDefined();

  let changing = false;
  let changed = false;

  list.listChanging.subscribe(x => {
    expect(changed).toBe(false);
    changing = true;
  });

  list.listChanged.subscribe(x => {
    expect(changing).toBe(true);
    changed = true;
  });

  list.add(testValue);

  expect(changed).toBe(true);
  expect(list.length()).toBe(1);
  expect(list.get(0)).toBe(testValue);
}

export default TestObservableList;
