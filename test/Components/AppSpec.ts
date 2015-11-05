'use strict';

import TestObservableProperty from '../Utils/ObservablePropertyUtils';
import TestObservableList from '../Utils/ObservableListUtils';

import AppViewModel from '../../src/Components/App/AppViewModel';
import AlertViewModel from '../../src/Components/Alert/AlertViewModel';

describe('App', () => {
  it('Has Falsy config properties by default', () => {
    let vm = new AppViewModel();
    expect(vm.config.EnableViewModelDebugging).toBeFalsy();
    expect(vm.config.EnableViewDebugging).toBeFalsy();
    expect(vm.config.EnableRouteDebugging).toBeFalsy();
    expect(vm.config.EnableStoreDebugging).toBeFalsy();
  });

  it('Has an observable alerts list', () => {
    let vm = new AppViewModel();
    TestObservableList(vm.alerts, new AlertViewModel(vm.alerts, 1, 'test'));
  });
});
