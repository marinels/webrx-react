'use strict';

import TestObservableProperty from '../Utils/ObservablePropertyUtils';
import TestObservableList from '../Utils/ObservableListUtils';

import AppViewModel from '../../src/Components/App/AppViewModel';
import AlertViewModel from '../../src/Components/Alert/AlertViewModel';

describe('App', () => {
  it('Has Falsy config properties by default', () => {
    let vm = new AppViewModel();
    expect(vm.config.EnableViewModelDebugging).toBe(false);
    expect(vm.config.EnableViewDebugging).toBe(false);
    expect(vm.config.EnableRouteDebugging).toBe(false);
    expect(vm.config.EnableStoreDebugging).toBe(false);
  });

  it('Has an observable alerts list', () => {
    let vm = new AppViewModel();
    TestObservableList(vm.alerts, new AlertViewModel(vm.alerts, 1, 'test'));
  });
});
