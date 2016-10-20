import * as React from 'react';
import { FormGroup, InputGroup, FormControl, Button, MenuItem, Panel } from 'react-bootstrap';

import * as wx from 'webrx';
import * as wxr from '../../web.rx.react';
import * as renderHelpers from '../React/RenderHelpers';
import * as bindingHelpers from '../React/BindingHelpers';

const {
  CommandButton,
  Loading,
  Splash,
  TimeSpanInputView,
  ContextMenu,
  ProfilePicture,
  ListView,
  StandardListView,
  TreeListView,
  DataGridView,
  DataGridColumn,
  DataGridListViewTemplate,
  ModalDialogView,
  TabsView,
} = wxr.Components;

export interface ViewActivator {
  (component: any, componentRoute: string): any;
}

export interface ViewActivatorMap {
  [key: string]: ViewActivator;
}

const logger = wxr.Logging.getLogger('Demo.ViewMap');

const viewMap: ViewActivatorMap = {
  Loading: () => <Loading text='Standard Loader...' />,
  SizedLoading: (c, cr) => renderHelpers.renderSizedLoadable(true, '50px Loader...', 50),
  Splash: () => <Splash fluid header='WebRx.React Demo' logo='http://placehold.it/100x100?text=Logo' />,
  CommandButton: () => (
    <div>
      <FormGroup bsSize='large'>
        <InputGroup>
          <FormControl id='CommandButtonParamInput' type='text' placeholder='Enter Command Parameter Text Here...' />
          <InputGroup.Button>
            <CommandButton bsSize='large' commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={wx.command(x => wxr.Alert.create(x, 'CommandButton Pressed'))}>Execute Command</CommandButton>
          </InputGroup.Button>
        </InputGroup>
      </FormGroup>
    </div>
  ),
  Alert: () => (
    <div>
      <Button onClick={() => wxr.Alert.create(`Alert Content: ${new Date()}`, 'Info Alert', 'info')}>Info Alert</Button>
      <Button onClick={() => wxr.Alert.createForError(new Error(`Error Message: ${new Date()}`), 'Error Alert')}>Error Alert</Button>
    </div>
  ),
  TimeSpanInputViewModel: (viewModel: wxr.Components.TimeSpanInputViewModel) => <TimeSpanInputView viewModel={viewModel} id='demo' placeholder='Type in a timespan, or use the controls on the right...' />,
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
  ListViewModel: (viewModel: wxr.Components.ListViewModel<any, any>, componentRoute: string) => {
    switch (componentRoute) {
      case 'List':
        return (
          <ListView viewModel={viewModel} checkmarkSelected view={new StandardListView<any>(undefined, (v, x) => {
            return `${x.name} (Required By ${x.requiredBy})`;
          })}>
          </ListView>
        );
      case 'Tree':
        return (
          <ListView viewModel={viewModel} checkmarkSelected multiSelect view={
            new TreeListView<any>(x => x.expanded, (x, i, e) => x.expanded = e, x => x.items, false, false, () => true, (v, x) => {
              return `${x.name} (Required By ${x.requiredBy})`;
            })
          }>
          </ListView>
        );
      case 'PanelList':
        return (
          <Panel header='List View Embedded Within a Panel' style={({ margin: 0 })}>
            <ListView viewModel={viewModel} checkmarkSelected fill view={new StandardListView<any>(undefined, (v, x) => {
              return `${x.name} (Required By ${x.requiredBy})`;
            })}>
            </ListView>
          </Panel>
        );
      default:
        return null;
    }
  },
  DataGridViewModel: (viewModel: wxr.Components.DataGridViewModel<any>, componentRoute: string) => {
    let view: wxr.Components.DataGridViewTemplate = undefined;
    let columns: any;
    let hidePager = false;

    if (componentRoute === 'DataGridList') {
      hidePager = true;

      view = new DataGridListViewTemplate<{name: string, requiredBy: string}>(
        x => `Name: ${x.name}, Required By: ${x.requiredBy}`
      );
    }

    if (componentRoute === 'DataGrid') {
      columns = [
        <DataGridColumn key='name' fieldName='name' sortable />,
        <DataGridColumn key='requiredBy' fieldName='requiredBy' sortable width={250} />,
      ];
    }

    return (
      <DataGridView key={componentRoute} viewModel={viewModel} view={view} hideSearch hidePager={ hidePager }>
        { columns }
      </DataGridView>
    );
  },
  ModalDialogViewModel: (data: { viewModel: wxr.Components.ModalDialogViewModel, accept: wx.ICommand<any>, reject: wx.ICommand<any> }) => (
    <div>
      <Button onClick={ bindingHelpers.bindEventToCommand(this, data.viewModel, x => x.show) }>Show Confirmation Dialog</Button>
      <ModalDialogView viewModel={ data.viewModel } title='Demo Modal Confirmation Dialog' body='You can put custom content here'>
        <CommandButton bsStyle='primary' command={ data.viewModel.hideOnExecute(data.accept) }>Accept</CommandButton>
        <CommandButton bsStyle='danger' command={ data.viewModel.hideOnExecute(data.reject) }>Reject</CommandButton>
        <CommandButton bsStyle='default' command={ data.viewModel.hide }>Cancel</CommandButton>
      </ModalDialogView>
    </div>
  ),
  TabsViewModel: (viewModel: wxr.Components.TabsViewModel<any>) => {
    let c = 0;
    return (
      <div>
        <Button style={({ width: '100%', marginBottom: 10 })}
          onClick={() => { viewModel.items.add(++c); viewModel.selectIndex.execute(viewModel.items.length() - 1); } }>
          Create Tab
        </Button>
        <TabsView viewModel={viewModel} id='demo-tabs' dataTemplate={(x, i) => (
          <Button style={({ width: '100%', marginTop: 10 })}
            onClick={() => { viewModel.items.removeAt(i); viewModel.selectIndex.execute(i - 1); } }>
            Close Tab{i}
          </Button>
        )} />
      </div>
    );
  },
};

export const Default = viewMap;
