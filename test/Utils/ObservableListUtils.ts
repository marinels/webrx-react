import { expect } from 'chai';

import { wx } from '../../src/WebRx';

export function TestObservableList<T>(list: wx.IObservableList<T>, testValue: T): void {
  expect(list.listChanging).to.exist;
  expect(list.listChanged).to.exist;

  let changing = false;
  let changed = false;

  list.listChanging.subscribe(x => {
    expect(changed).to.equal(false);
    changing = true;
  });

  list.listChanged.subscribe(x => {
    expect(changing).to.equal(true);
    changed = true;
  });

  list.add(testValue);

  expect(changed).to.equal(true);
  expect(list.length()).to.equal(1);
  expect(list.get(0)).to.equal(testValue);
}

export default TestObservableList;
