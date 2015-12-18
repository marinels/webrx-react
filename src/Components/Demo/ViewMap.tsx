'use strict';

import * as React from 'react';

import BaseViewModel from '../React/BaseViewModel';

// import DataGridViewModel from '../Common/DataGrid/DataGridViewModel';
// import { DataGridView, DataGridColumn } from '../Common/DataGrid/DataGridView';

export interface IViewActivator {
  (viewModel: BaseViewModel): any;
}

export interface IViewMap {
  [key: string]: IViewActivator;
}

let viewMap: IViewMap = {
  // DataGridViewModel: (viewModel: DataGridViewModel<any>) => (
  //   <DataGridView viewModel={viewModel}>
  //     <DataGridColumn fieldName='id' header='ID' sortable />
  //     <DataGridColumn fieldName='value' header='Value' sortable className='col-md-4' />
  //   </DataGridView>
  // ),
};

export default viewMap;
