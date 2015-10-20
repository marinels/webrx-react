'use strict';

import TestObservableProperty from '../Utils/ObservablePropertyUtils';
import TestObservableList from '../Utils/ObservableListUtils';

import AppViewModel from '../../src/Components/App/AppViewModel';

describe('App', () => {
  it('Has Falsy config properties by default', () => {
    let vm = new AppViewModel();
    expect(vm.config.EnablePropertyChangedDebugging).toBeFalsy(false);
    expect(vm.config.EnableViewRenderDebugging).toBeFalsy(false);
    expect(vm.config.EnableRouteDebugging).toBeFalsy(false);
    expect(vm.config.EnableStoreApiDebugging).toBeFalsy(false);
  });

  it('Has an observable status property', () => {
    let vm = new AppViewModel();
    TestObservableProperty(vm.status, 'asdf');
  });

  it('Has an observable alerts list', () => {
    let vm = new AppViewModel();
    TestObservableList(vm.alerts, 'asdf');
  });
});
