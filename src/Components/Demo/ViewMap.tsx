import * as React from 'react';
import * as wx from 'webrx';
import { Form, FormGroup, InputGroup, FormControl, Button, MenuItem, Panel, Tab, Well, ListGroup, ListGroupItem, Table } from 'react-bootstrap';

import { Logging, Alert } from '../../Utils';
import { renderSizedLoadable, bindEventToCommand } from '../React';
import * as Components from '../Common';

import {
  CommandButton,
  Loading,
  Splash,
  TimeSpanControl,
  TimeSpanInputView,
  ContextMenu,
  ProfilePicture,
  ListView,
  ListViewTemplate,
  TreeViewTemplate,
  DataGridView,
  DataGridColumn,
  DataGridListViewTemplate,
  ModalDialogView,
  TabRenderTemplate,
  TabsView,
  CommonPanel,
  CountFooterContent,
  ViewAllFooterAction,
  ItemListPanelView,
  InlineEditView,
} from '../Common';

export interface ViewActivator {
  (component: any, componentRoute: string): any;
}

export interface ViewActivatorMap {
  [key: string]: ViewActivator;
}

const logger = Logging.getLogger('Demo.ViewMap');

const listTemplate = new ListViewTemplate<any>((x, i, vm, v) => {
  return `${ x.name } (Required By ${ x.requiredBy })`;
});

const treeTemplate = new TreeViewTemplate<any>(
  x => x.items,
  x => {
    return `${ x.name } (Required By ${ x.requiredBy })`;
  },
  () => true
);

const viewMap: ViewActivatorMap = {
  Loading: () => <Loading text='Standard Loader...' />,
  SizedLoading: (c, cr) => renderSizedLoadable(true, '50px Loader...', 50),
  Splash: () => <Splash fluid header='WebRx-React Demo' logo='http://placehold.it/100x100?text=Logo' />,
  CommandButton: () => (
    <Form>
      <FormGroup bsSize='large' style={({ marginBottom: 0 })}>
        <InputGroup>
          <FormControl id='CommandButtonParamInput' type='text' placeholder='Enter Command Parameter Text Here...' />
          <InputGroup.Button>
            <CommandButton bsSize='large' commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={wx.command(x => Alert.create(x, 'CommandButton Pressed'))}>Execute Command</CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    </Form>
  ),
  Alert: () => (
    <div>
      <Button onClick={() => Alert.create(`Alert Content: ${new Date()}`, 'Info Alert', 'info')}>Info Alert</Button>
      <Button onClick={() => Alert.createForError(new Error(`Error Message: ${new Date()}`), 'Error Alert')}>Error Alert</Button>
    </div>
  ),
  TimeSpanInputViewModel: (viewModel: Components.TimeSpanInputViewModel) => (
    <div>
      <TimeSpanInputView viewModel={ viewModel } />
      <TimeSpanInputView viewModel={ viewModel } >
        <TimeSpanControl viewModel={ viewModel } id='custom' placeholder='You can also use your own custom control component' />
      </TimeSpanInputView>
    </div>
  ),
  ContextMenu: () => (
    <div>
      <ContextMenu id='demo' header='Optional Header' onSelect={(item) => {
        logger.info(item.eventKey || item.href);
      }}>
        <div style={({ padding: 15, border: '1px dashed black' })}>Right Click Here for the Context Menu</div>

        <MenuItem header>Section Header</MenuItem>
        <MenuItem title='Item 1 Tooltip' href='#/demo/ContextMenu?clicked=1'>Item 1</MenuItem>
        <MenuItem title='#/demo/ContextMenu' eventKey={({val: 1})}>Item 2</MenuItem>
        <MenuItem divider />
        <MenuItem header>Disabled Items</MenuItem>
        <MenuItem disabled>Item 3</MenuItem>
      </ContextMenu>
    </div>
  ),
  ProfilePicture: () => {
    let style = { margin: '5px' };
    let imageData = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAA8CAYAAADWibxkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5JREFUeNrkm0tIVFEYx8+dhzajNGZqOjqZj9TULJkwe1CL0DQpI4yoaBVCQbZw06IHTLSqoNrMoiKIQiNqyLAs2gypEBUY0cwqe4gERkHhlJTp9P/yDIQ6mcw513vn/uGHgnruPf8533e+81Bxu91sDmQF28FmUAlc4Bu4A06Bz6IeNDo6ylwuF+vs7Jz25xaVO54GtoG9oBzMA4n8PRaAZrAYnAGvQEj2C6llgAJ2AA8om+F96Pe2gucgCLpBF/go48VMKnSePuHz4OYMnZ8cImvAfnAF9ICdejTABi6BwzE8i/5uKWgDLXoz4CTYJzBcKTfU6MWAWnBIQji16MEAiuFWnuVFaz3I0roBy/kcLyuppmvdgAaJoWXiyVXTBpRLriksWjcgi8mVpg1I5iWvYUeAQ2SM6jEHUJY2Sx7+2Vo2QOHIVCM3WpMGhFVYYOWKqgVkGDAGxiUbQPsEw1o1gHZ2fko24DX4qlUDPnFk6oHWC6EuiZ1/J7J9WQZcAH2S2j4rcoTJMoDi87SEdm+Bi3rYDyDdBfcEtvcFnAOjejHgOzjCxO3xvwFPZdTVMhUAzwS19Qj80psBJL+ANkbANVkrK9nqFtDGE1786NKAPgHzNp0S/dCrATR8fTG28Vbm5oIa+hDjJ5iqdwPyY1y/14ha/6ttAJ3pednEqXAs2giOgxQ9GUAHIw/BQUFD+CigWw6FejBgN7gB8gS3uw60A6dWDSgFl8FVGcOVaxV/RpoWDKDd3xw2caujjRcsdKnBKjm31PNwqI81vGZ7wEC7vYvACkC3q+gQlG5y5DL1tRrcBy95uU3fP+Z1hzADaOqhY65qUMG/0pSWweQefsxGFZwD4AW4zemPxYCVoAls4nE9n2lfCaCKc4zvRfj4Evp91Bh2Oqck1EK+mdHI4zuR6U/0znRC3aQoSmMoFMrNzMwMlJSUDP9PEqTEUsDiQ4rJZMofGxtr9Xg8PXV1dbuCweA/DaCQaGBxJovlT6QvGRgYuN7c3LwnEAhENSCHFxtxJ4wElpSUZBkcHDzh9/vToxlA01syi1OFw2FmtVpdNputMpoBFSz+ZWcT95KnNWBtvPfe4XAwr9e7ob+/f4oBjjmq6NSdFhSFjYyMNHV0dBRNNoBKW5cBQoDyQIbP56udbEB1PCfAyaMACXELTYemv+Z/NzOIzGYzGxoaKm5vb7dFDFgIljEDCXVBBqbDvIgBaRJ2b/QwHRZHDIj8/46hBgHIjhhQZLDO00zAUBY7IwaUGs0Au93Oent7C0w8AZYZzQBaFyQkJKSSASVM3g6u5itjMqDKgAkwohQLXwHSbi/dvRk3UOep77bfAgwAst2xTAPm/mIAAAAASUVORK5CYII=';

    return (
      <div>
        <div>
          <ProfilePicture style={style} src={null} title='Basic Icon' />
          <ProfilePicture style={style} src={null} iconSize='2x' title='2x Size Icon' />
          <ProfilePicture style={style} src={null} thumbnail title='Thumbnail Icon' />
          <ProfilePicture style={style} src={null} iconSize='2x' thumbnail size={40} title='Fixed Width/Height Icon' />
          <ProfilePicture style={style} src={null} iconSize='2x' thumbnail rounded size={40} title='Rounded Icon' />
          <ProfilePicture style={style} src={imageData} title='Basic Image' />
          <ProfilePicture style={style} src={imageData} rounded title='Rounded Image' />
          <ProfilePicture style={style} src={imageData} thumbnail title='Thumbnail Image' />
          <ProfilePicture style={style} src={imageData} thumbnail size={40} title='Fixed Width/Height Image' />
        </div>
        <div style={({ height: 250 })}>
          <ProfilePicture style={style} src={imageData} thumbnail responsive title='Responsive Image' />
        </div>
      </div>
    );
  },
  ListViewModel: (viewModel: Components.ListViewModel<any, any>, componentRoute: string) => {
    switch (componentRoute) {
      case 'List':
        return (
          <ListView viewModel={ viewModel } view={ listTemplate } />
        );
      case 'Tree':
        return (
          <ListView viewModel={ viewModel } selectable checkmarkSelected view={ treeTemplate } />
        );
      case 'PanelList':
        return (
          <Panel header='List View Embedded Within a Panel' style={({ margin: 0 })}>
            <ListView viewModel={ viewModel } selectable checkmarkSelected fill view={ listTemplate } />
          </Panel>
        );
      default:
        return null;
    }
  },
  DataGridViewModel: (viewModel: Components.DataGridViewModel<any>, componentRoute: string) => {
    let view: Components.DataGridViewTemplate<{name: string, requiredBy: string}> = undefined;
    let columns: any;
    let pager = true;

    if (componentRoute === 'DataGridList') {
      pager = false;
      view = new DataGridListViewTemplate<{name: string, requiredBy: string}>(
        x => `Name: ${x.name}, Required By: ${x.requiredBy}`
      );
    }

    if (componentRoute === 'DataGrid') {
      columns = [
        <DataGridColumn key='name' fieldName='name' header='Name' sortable />,
        <DataGridColumn key='requiredBy' fieldName='requiredBy' header='Required By' sortable width={ 250 } />,
      ];
    }

    return (
      <DataGridView key={ componentRoute } viewModel={ viewModel } view={view} pager={ pager }>
        { columns }
      </DataGridView>
    );
  },
  AsyncDataGridViewModel: (viewModel: Components.AsyncDataGridViewModel<any, any>) => (
    <DataGridView viewModel={ viewModel } pager pagerLimits={ [ 1, 5, 10, null ] }>
      <DataGridColumn key='name' fieldName='name' header='Name' sortable />
      <DataGridColumn key='requiredBy' fieldName='requiredBy' header='Required By' sortable width={ 250 } />
    </DataGridView>
  ),
  ModalDialogViewModel: (data: { viewModel: Components.ModalDialogViewModel, accept: wx.ICommand<any>, reject: wx.ICommand<any> }) => (
    <div>
      <Button onClick={ bindEventToCommand(this, data.viewModel, x => x.show) }>Show Confirmation Dialog</Button>
      <ModalDialogView viewModel={ data.viewModel } title='Demo Modal Confirmation Dialog' body='You can put custom content here'>
        <CommandButton bsStyle='primary' command={ data.viewModel.hideOnExecute(data.accept) }>Accept</CommandButton>
        <CommandButton bsStyle='danger' command={ data.viewModel.hideOnExecute(data.reject) }>Reject</CommandButton>
        <CommandButton bsStyle='default' command={ data.viewModel.hide }>Cancel</CommandButton>
      </ModalDialogView>
    </div>
  ),
  TabsViewModel: (viewModel: Components.TabsViewModel<any>, componentRoute: string) => {
    if (componentRoute === 'StaticTabs') {
      return (
        <TabsView viewModel={viewModel} id='demo-tabs'>
          <Tab title='First Static Tab'><Well style={({ margin: 0 })}>Content 1</Well></Tab>
          <Tab title='Second Static Tab'><Well style={({ margin: 0 })}>Content 2</Well></Tab>
        </TabsView>
      );
    }
    else {
      let c = 0;

      const template = new TabRenderTemplate<any>((x, i) => `Tab ${ i + 1 }`, (x, i, vm) => (
        <Button style={({ width: '100%', marginTop: 10 })} onClick={ () => { vm.tabs.removeAt(i); } }>
          { `Close Tab ${ i + 1 }` }
        </Button>
      ));

      return (
        <div>
          <Button style={({ width: '100%', marginBottom: 10 })} onClick={() => { viewModel.tabs.add(++c); } }>
            Create Tab
          </Button>
          <TabsView viewModel={ viewModel } id='demo-tabs' template={ template } />
        </div>
      );
    }
  },
  CommonPanel: () => (
    <CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      Add any content to the panel body!
      <Loading fontSize={ 24 } text='Such as a Loader...' />
      <Button onClick={() => Alert.create('Button Clicked', 'Common Panel Demo')}>Or Even a Button</Button>
    </CommonPanel>
  ),
  CommonPanelList: () => (
    <CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      <ListGroup fill>
        <ListGroupItem>Item 1</ListGroupItem>
        <ListGroupItem>Item 2</ListGroupItem>
        <ListGroupItem>Item 3</ListGroupItem>
      </ListGroup>
    </CommonPanel>
  ),
  CommonPanelTable: () => (
    <CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      <Table fill>
        <thead><tr><th>Some Column</th></tr></thead>
        <tbody><tr><td>Row Data!</td></tr></tbody>
      </Table>
    </CommonPanel>
  ),
  ItemListPanelViewModel: (viewModel: Components.ItemListPanelViewModel<any>) => (
    <ItemListPanelView viewModel={viewModel} headerContent='Sample Data' collapsible
      headerActions={[ { id: 'header', children: 'Header Action' } ]}
      footerContent={ (<CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
      footerActions={[ { id: 'footer', bsStyle: 'primary', command: viewModel.navigate, children: (<ViewAllFooterAction suffix='Things' />) } ]}
    >
      <DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
      <DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
    </ItemListPanelView>
  ),
  AsyncItemListPanelViewModel: (viewModel: Components.AsyncItemListPanelViewModel<any, any>) => (
    <ItemListPanelView viewModel={viewModel} headerContent='Sample Data' collapsible
      headerActions={[ { id: 'footer', bsStyle: 'primary', command: viewModel.navigate, children: (<ViewAllFooterAction suffix='Things' />) } ]}
      footerContent={ (<CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
      footerActions={[ { id: 'refresh', command: viewModel.grid.refresh, children: 'Refresh' } ]}
    >
      <DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
      <DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
    </ItemListPanelView>
  ),
  InlineEditViewModel: (viewModel: Components.InlineEditViewModel<any>) => (
    <InlineEditView style={({ margin: 0 })} viewModel={viewModel} inputType='number' template={ x => `${ x } of 10` } keyboard />
  ),
};

export const ViewMap = viewMap;
