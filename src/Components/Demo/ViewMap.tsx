'use strict';

import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';

import SplashViewModel from '../Common/Splash/SplashViewModel';
import SplashView from '../Common/Splash/SplashView';

import { TimeSpanInput, UnitTypes } from '../Common/TimeSpanInput/TimeSpanInput';

import { ContextMenu, MenuItem } from '../Common/ContextMenu/ContextMenu';

import ListViewModel from '../Common/List/ListViewModel';
import { ListView, StandardView } from '../Common/List/ListView';

import DataGridViewModel from '../Common/DataGrid/DataGridViewModel';
import { DataGridView, DataGridColumn, IDataGridView, ListView as DataGridListView } from '../Common/DataGrid/DataGridView';

export interface IViewActivator {
  (component: any, componentRoute: string): any;
}

export interface IViewMap {
  [key: string]: IViewActivator;
}

let viewMap: IViewMap = {
  SplashViewModel: (viewModel: SplashViewModel) => <SplashView viewModel={viewModel} />,
  TimeSpanInput: () => <TimeSpanInput placeholder='Type in a timespan, or use the controls on the right...' minUnit={UnitTypes.Days} standalone />,
  ContextMenu: () => (
    <div>
      <ContextMenu id='demo' header='Demo Context Menu' items={[
        new MenuItem('Item 1', () => console.log('Item 1 Clicked'), 'fa-flask'),
        new MenuItem('Item 2', () => console.log('Item 2 Clicked'), 'fa-flask'),
        new MenuItem('Item 3', null, 'fa-flask'),
      ]}>
        <span>Right Click Here for the Context Menu</span>
      </ContextMenu>
    </div>
  ),
  ListViewModel: (viewModel: ListViewModel<any, any>) => (
    <ListView viewModel={viewModel} checkmarkSelected view={new StandardView<any>(undefined, (v, x) => {
      return `${x.name} (Required By ${x.requiredBy})`;
    })}>
    </ListView>
  ),
  DataGridViewModel: (viewModel: DataGridViewModel<any>, componentRoute: string) => {
    let view: IDataGridView = undefined;

    if (componentRoute === 'DataGridList') {
      view = new DataGridListView<{name: string, requiredBy: string}>(
        (v, vm, x, i) => (
          <ListGroupItem key={x.name} className='ItemRow' onClick={() => {}}>
            {`Name: ${x.name}, Required By: ${x.requiredBy}`}
          </ListGroupItem>
        )
      );
    }

    return (
      <DataGridView viewModel={viewModel} view={view}>
        <DataGridColumn fieldName='name' sortable />
        <DataGridColumn fieldName='requiredBy' sortable />
      </DataGridView>
    );
  },
};

export default viewMap;
