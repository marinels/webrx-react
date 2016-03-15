'use strict';

import * as React from 'react';
import { ListGroupItem, Button } from 'react-bootstrap';

import Splash from '../Common/Splash/Splash';

import { TimeSpanInputViewModel, UnitType } from '../Common/TimeSpanInput/TimeSpanInputViewModel';
import TimeSpanInputView from '../Common/TimeSpanInput/TimeSpanInputView';

import { ContextMenu, MenuItem } from '../Common/ContextMenu/ContextMenu';

import ProfilePictureView from '../Common/ProfilePicture/ProfilePictureView';

import ListViewModel from '../Common/List/ListViewModel';
import { ListView, StandardView } from '../Common/List/ListView';

import DataGridViewModel from '../Common/DataGrid/DataGridViewModel';
import { DataGridView, DataGridColumn, IDataGridView, ListView as DataGridListView } from '../Common/DataGrid/DataGridView';

import ModalDialogViewModel from '../Common/ModalDialog/ModalDialogViewModel';
import ModalDialogView from '../Common/ModalDialog/ModalDialogView';

export interface IViewActivator {
  (component: any, componentRoute: string): any;
}

export interface IViewMap {
  [key: string]: IViewActivator;
}

let viewMap: IViewMap = {
  Splash: () => <Splash fluid animationPeriod={100} text='WebRx.React Demo' logo='http://placehold.it/100x100?text=Logo' />,
  TimeSpanInputViewModel: (viewModel: TimeSpanInputViewModel) => <TimeSpanInputView viewModel={viewModel} id='demo' placeholder='Type in a timespan, or use the controls on the right...' standalone />,
  ContextMenu: () => (
    <div>
      <ContextMenu id='demo' header='Demo Context Menu' items={[
        new MenuItem('Item 1', () => console.log('Item 1 Clicked'), 'flask'),
        new MenuItem('Item 2', () => console.log('Item 2 Clicked'), 'flask'),
        new MenuItem('Item 3', null, 'flask'),
      ]}>
        <span>Right Click Here for the Context Menu</span>
      </ContextMenu>
    </div>
  ),
  ProfilePicture: () => {
    let style = { margin: '5px' };
    let imageData = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAA8CAYAAADWibxkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5JREFUeNrkm0tIVFEYx8+dhzajNGZqOjqZj9TULJkwe1CL0DQpI4yoaBVCQbZw06IHTLSqoNrMoiKIQiNqyLAs2gypEBUY0cwqe4gERkHhlJTp9P/yDIQ6mcw513vn/uGHgnruPf8533e+81Bxu91sDmQF28FmUAlc4Bu4A06Bz6IeNDo6ylwuF+vs7Jz25xaVO54GtoG9oBzMA4n8PRaAZrAYnAGvQEj2C6llgAJ2AA8om+F96Pe2gucgCLpBF/go48VMKnSePuHz4OYMnZ8cImvAfnAF9ICdejTABi6BwzE8i/5uKWgDLXoz4CTYJzBcKTfU6MWAWnBIQji16MEAiuFWnuVFaz3I0roBy/kcLyuppmvdgAaJoWXiyVXTBpRLriksWjcgi8mVpg1I5iWvYUeAQ2SM6jEHUJY2Sx7+2Vo2QOHIVCM3WpMGhFVYYOWKqgVkGDAGxiUbQPsEw1o1gHZ2fko24DX4qlUDPnFk6oHWC6EuiZ1/J7J9WQZcAH2S2j4rcoTJMoDi87SEdm+Bi3rYDyDdBfcEtvcFnAOjejHgOzjCxO3xvwFPZdTVMhUAzwS19Qj80psBJL+ANkbANVkrK9nqFtDGE1786NKAPgHzNp0S/dCrATR8fTG28Vbm5oIa+hDjJ5iqdwPyY1y/14ha/6ttAJ3pednEqXAs2giOgxQ9GUAHIw/BQUFD+CigWw6FejBgN7gB8gS3uw60A6dWDSgFl8FVGcOVaxV/RpoWDKDd3xw2caujjRcsdKnBKjm31PNwqI81vGZ7wEC7vYvACkC3q+gQlG5y5DL1tRrcBy95uU3fP+Z1hzADaOqhY65qUMG/0pSWweQefsxGFZwD4AW4zemPxYCVoAls4nE9n2lfCaCKc4zvRfj4Evp91Bh2Oqck1EK+mdHI4zuR6U/0znRC3aQoSmMoFMrNzMwMlJSUDP9PEqTEUsDiQ4rJZMofGxtr9Xg8PXV1dbuCweA/DaCQaGBxJovlT6QvGRgYuN7c3LwnEAhENSCHFxtxJ4wElpSUZBkcHDzh9/vToxlA01syi1OFw2FmtVpdNputMpoBFSz+ZWcT95KnNWBtvPfe4XAwr9e7ob+/f4oBjjmq6NSdFhSFjYyMNHV0dBRNNoBKW5cBQoDyQIbP56udbEB1PCfAyaMACXELTYemv+Z/NzOIzGYzGxoaKm5vb7dFDFgIljEDCXVBBqbDvIgBaRJ2b/QwHRZHDIj8/46hBgHIjhhQZLDO00zAUBY7IwaUGs0Au93Oent7C0w8AZYZzQBaFyQkJKSSASVM3g6u5itjMqDKgAkwohQLXwHSbi/dvRk3UOep77bfAgwAst2xTAPm/mIAAAAASUVORK5CYII=';

    return (
      <span>
        <ProfilePictureView style={style} src={null} title='Basic Icon' />
        <ProfilePictureView style={style} src={null} iconSize='4x' title='4x Size Icon' />
        <ProfilePictureView style={style} src={null} iconSize='4x' thumbnail title='Thumbnail Icon' />
        <ProfilePictureView style={style} src={null} iconSize='4x' thumbnail width={60} height={60} title='Fixed Width/Height Icon' />
        <ProfilePictureView style={style} src={null} iconSize='4x' thumbnail rounded width={60} height={60} title='Rounded Icon' />
        <ProfilePictureView style={style} src={imageData} title='Basic Image' />
        <ProfilePictureView style={style} src={imageData} rounded title='Rounded Image' />
        <ProfilePictureView style={style} src={imageData} thumbnail title='Thumbnail Image' />
        <ProfilePictureView style={style} src={imageData} thumbnail width={60} height={60} title='Fixed Width/Height Image' />
      </span>
    );
  },
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
        <DataGridColumn fieldName='requiredBy' sortable width={250} />
      </DataGridView>
    );
  },
  ModalDialogViewModel: (viewModel: ModalDialogViewModel<any>) => (
    <div>
      <Button onClick={() => viewModel.show.execute(null)}>Show Dialog</Button>
      <ModalDialogView viewModel={viewModel} />
    </div>
  ),
};

export default viewMap;
