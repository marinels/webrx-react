'use strict';

import { expect } from 'chai';

import * as Rx from 'rx';

import TestObservableProperty from '../Utils/ObservablePropertyUtils';
import TestObservableList from '../Utils/ObservableListUtils';

import AppViewModel from '../../src/Components/App/AppViewModel';
import AlertHostViewModel from '../../src/Components/Common/Alert/AlertHostViewModel';
import RouteHandlerViewModel from '../../src/Components/Common/RouteHandler/RouteHandlerViewModel';
import RouteManager from '../../src/Routing/RouteManager';
import PageHeaderViewModel from '../../src/Components/Common/PageHeader/PageHeaderViewModel';
import PageFooterViewModel from '../../src/Components/Common/PageFooter/PageFooterViewModel';

describe('App', () => {
  it('Has Falsy config properties by default', () => {
    let vm = new AppViewModel();
    expect(vm.config).to.exist;
  });

  it('Has an alert host commponent', () => {
    let vm = new AppViewModel();
    expect(vm.alerts).to.exist;
    expect(vm.alerts).to.be.an('AlertHostViewModel');
  });

  it('Has a route handler commponent if a route manager is provided', () => {
    let vm = new AppViewModel();
    expect(vm.routeHandler).to.be.undefined;

    vm = new AppViewModel(new RouteManager(Rx.Observable.never<string>()))
    expect(vm.routeHandler).to.exist;
    expect(vm.routeHandler).to.be.a('RouteHandlerViewModel');
  });

  it('Has a page header commponent', () => {
    let vm = new AppViewModel();
    expect(vm.header).to.exist;
    expect(vm.header).to.be.a('PageHeaderViewModel');
  });

  it('Has a page footer commponent', () => {
    let vm = new AppViewModel();
    expect(vm.footer).to.exist;
    expect(vm.footer).to.be.a('PageFooterViewModel');
  });
});
