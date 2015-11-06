'use strict';

import * as Rx from 'rx';

import TestObservableProperty from '../Utils/ObservablePropertyUtils';
import TestObservableList from '../Utils/ObservableListUtils';

import AppViewModel from '../../src/Components/App/AppViewModel';
import AlertHostViewModel from '../../src/Components/Alert/AlertHostViewModel';
import RouteHandlerViewModel from '../../src/Components/RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../src/Routing/RouteManager';
import PageHeaderViewModel from '../../src/Components/PageHeader/PageHeaderViewModel';
import PageFooterViewModel from '../../src/Components/PageFooter/PageFooterViewModel';

describe('App', () => {
  it('Has Falsy config properties by default', () => {
    let vm = new AppViewModel();
    expect(vm.config).toBeDefined();
    expect(vm.config.EnableViewModelDebugging).toBeFalsy();
    expect(vm.config.EnableViewDebugging).toBeFalsy();
    expect(vm.config.EnableRouteDebugging).toBeFalsy();
    expect(vm.config.EnableStoreDebugging).toBeFalsy();
  });

  it('Has an alert host commponent', () => {
    let vm = new AppViewModel();
    expect(vm.alerts).toBeDefined();
    expect(vm.alerts).toEqual(jasmine.any(AlertHostViewModel));
  });

  it('Has a route handler commponent if a route manager is provided', () => {
    let vm = new AppViewModel();
    expect(vm.routeHandler).toBeUndefined();

    vm = new AppViewModel(new RouteManager(Rx.Observable.never<string>()))
    expect(vm.routeHandler).toBeDefined();
    expect(vm.routeHandler).toEqual(jasmine.any(RouteHandlerViewModel));
  });

  it('Has a page header commponent', () => {
    let vm = new AppViewModel();
    expect(vm.header).toBeDefined();
    expect(vm.header).toEqual(jasmine.any(PageHeaderViewModel));
  });

  it('Has a page footer commponent', () => {
    let vm = new AppViewModel();
    expect(vm.footer).toBeDefined();
    expect(vm.footer).toEqual(jasmine.any(PageFooterViewModel));
  });
});
