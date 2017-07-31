import * as React from 'react';
import { Observable } from 'rxjs';
import { Icon } from 'react-fa';
import { Col, Form, FormGroup, InputGroup, FormControl, Button, MenuItem, Panel, Tab,
  Well, ListGroup, ListGroupItem, Table, OverlayTrigger, Overlay, Tooltip, Popover,
} from 'react-bootstrap';

import { wx, Property, Command } from '../../WebRx';
import { Logging, Alert } from '../../Utils';
import { wxr } from '../React';
import { SampleData, SampleTreeData } from './RoutingMap';
import * as Components from '../Common';
import { TodoListView } from './TodoList/TodoListView';
import { TodoListViewModel } from './TodoList/TodoListViewModel';
import { ComponentDemoViewModel } from './ComponentDemoViewModel';
import { ComponentDemoView, ViewActivatorMap } from './ComponentDemoView';
import { ViewMap as AppViewMap } from '../../Routing/ViewMap';

const logger = Logging.getLogger('Demo.ViewMap');

const sampleDataTemplate = (x: SampleData) => {
  return (
    <div>
      <div>
        <span>Name: </span><span>{ x.name }</span>
      </div>
      <div>
        <span>Required By: </span><span>{ x.requiredBy }</span>
      </div>
    </div>
  );
};

const listTemplate = new Components.ListViewTemplate<SampleData>(
  (x, i, vm, v) => {
    return sampleDataTemplate(x);
  },
  (x, i, vm, v) => {
    return [
      <Components.NavButton key='nav' href={ `#/name/${ x.name }` } />,
    ];
  },
);

// this template renders a custom template container to show how we can
// inject a custom button that wraps our item template
const listCmdTemplate = new Components.ListViewTemplate<SampleData>(
  (x, i, vm, v) => {
    return sampleDataTemplate(x);
  },
  undefined, undefined,
  (contents, x, i, vm, v) => {
    return (
      <Components.CommandButton block plain href={ `#/name/${ x.name }` }>
        { contents }
      </Components.CommandButton>
    );
  },
);

const treeTemplate = new Components.TreeViewTemplate<SampleTreeData>(
  (x, vm, v) => x.items,
  (n, x, i, vm, v) => {
    return sampleDataTemplate(x);
  },
  (n, x, i, vm, v) => {
    return [
      <Components.NavButton key='nav' href={ `#/name/${ x.name }` } />,
    ];
  },
  x => x.key,
  undefined,
  (x, vm, v) => {
    const search: Components.SearchViewModel = vm.getSearch();

    if (search != null) {
      return wx
        .whenAny(search.filter, y => String.isNullOrEmpty(y) === false);
    }

    return Observable.of(false);
  },
  true,
);

export const demoViewMap: ViewActivatorMap = {
  Loading: () => <Components.Loading text='Standard Loader...' />,
  SizedLoading: (c, cr) => wxr.renderSizedLoadable(true, '50px Loader...', 50),
  Splash: () => <Components.Splash fluid header='webrx-react Demo' logo='http://placehold.it/100x100?text=Logo' />,
  CommandButton: () => (
    <Form>
      <FormGroup bsSize='large' style={({ marginBottom: 0 })}>
        <InputGroup>
          <FormControl id='CommandButtonParamInput' type='text' placeholder='Enter Command Parameter Text Here...' />
          <InputGroup.Button>
            <Components.CommandButton bsSize='large'
              commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
              tooltip='Embedded Command Tooltips!!!'
            >
              Execute Command
            </Components.CommandButton>
            <Components.CommandButton bsSize='large'
              commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
              tooltip={ (<Popover id='cmd-btn-custom-tt' placement='top'>Custom Tooltip</Popover>) }
            >
              Same Command
            </Components.CommandButton>
            <Components.CommandButton bsSize='large'
              commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
              tooltip={(
                <OverlayTrigger placement='bottom'
                  overlay={ (<Tooltip id='cmd-btn-custom-tt'>Custom Overlay Tooltip</Tooltip>) }
                />
              )}
            >
              Same Again
            </Components.CommandButton>
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
  ObservableWrapper: () => (
    <Components.ObservableWrapper observableOrProperty={ Observable.timer(0, 1000) } render={ x => (<div>Current Value is { x }</div>) } />
  ),
  SearchViewModel: (viewModel: Components.SearchViewModel) => (
    <Form horizontal>
      <FormGroup>
        <Col sm={12}>
          <Components.SearchView viewModel={ viewModel } />
        </Col>
      </FormGroup>
    </Form>
  ),
  TimeSpanInputViewModel: (viewModel: Components.TimeSpanInputViewModel) => (
    <Form>
      <Components.TimeSpanInputView viewModel={ viewModel } />
      <Components.TimeSpanInputView viewModel={ viewModel } >
        <Components.TimeSpanControl viewModel={ viewModel } id='custom' placeholder='You can also use your own custom control component' />
      </Components.TimeSpanInputView>
    </Form>
  ),
  ContextMenu: () => (
    <div>
      <Components.ContextMenu id='demo' header='Optional Header' onSelect={(item) => {
        const content = String.isNullOrEmpty(item.eventKey) ?
          item.href :
          `eventKey = ${ String.stringify(item.eventKey) }`;

        Alert.create(content, 'Context Menu Item Clicked');
      }}>
        <div style={({ padding: 15, border: '1px dashed black' })}>Right Click Here for the Context Menu</div>

        <MenuItem header>Section Header</MenuItem>
        <MenuItem title='Item 1 Tooltip' href='#/demo/ContextMenu?clicked=1'>Item 1</MenuItem>
        <MenuItem title='#/demo/ContextMenu' eventKey={({val: 1})}>Item 2</MenuItem>
        <MenuItem divider />
        <MenuItem header>Disabled Items</MenuItem>
        <MenuItem disabled>Item 3</MenuItem>
      </Components.ContextMenu>
    </div>
  ),
  ProfilePicture: () => {
    let style = { margin: '5px' };
    let imageData = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAAA8CAYAAADWibxkAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA+5JREFUeNrkm0tIVFEYx8+dhzajNGZqOjqZj9TULJkwe1CL0DQpI4yoaBVCQbZw06IHTLSqoNrMoiKIQiNqyLAs2gypEBUY0cwqe4gERkHhlJTp9P/yDIQ6mcw513vn/uGHgnruPf8533e+81Bxu91sDmQF28FmUAlc4Bu4A06Bz6IeNDo6ylwuF+vs7Jz25xaVO54GtoG9oBzMA4n8PRaAZrAYnAGvQEj2C6llgAJ2AA8om+F96Pe2gucgCLpBF/go48VMKnSePuHz4OYMnZ8cImvAfnAF9ICdejTABi6BwzE8i/5uKWgDLXoz4CTYJzBcKTfU6MWAWnBIQji16MEAiuFWnuVFaz3I0roBy/kcLyuppmvdgAaJoWXiyVXTBpRLriksWjcgi8mVpg1I5iWvYUeAQ2SM6jEHUJY2Sx7+2Vo2QOHIVCM3WpMGhFVYYOWKqgVkGDAGxiUbQPsEw1o1gHZ2fko24DX4qlUDPnFk6oHWC6EuiZ1/J7J9WQZcAH2S2j4rcoTJMoDi87SEdm+Bi3rYDyDdBfcEtvcFnAOjejHgOzjCxO3xvwFPZdTVMhUAzwS19Qj80psBJL+ANkbANVkrK9nqFtDGE1786NKAPgHzNp0S/dCrATR8fTG28Vbm5oIa+hDjJ5iqdwPyY1y/14ha/6ttAJ3pednEqXAs2giOgxQ9GUAHIw/BQUFD+CigWw6FejBgN7gB8gS3uw60A6dWDSgFl8FVGcOVaxV/RpoWDKDd3xw2caujjRcsdKnBKjm31PNwqI81vGZ7wEC7vYvACkC3q+gQlG5y5DL1tRrcBy95uU3fP+Z1hzADaOqhY65qUMG/0pSWweQefsxGFZwD4AW4zemPxYCVoAls4nE9n2lfCaCKc4zvRfj4Evp91Bh2Oqck1EK+mdHI4zuR6U/0znRC3aQoSmMoFMrNzMwMlJSUDP9PEqTEUsDiQ4rJZMofGxtr9Xg8PXV1dbuCweA/DaCQaGBxJovlT6QvGRgYuN7c3LwnEAhENSCHFxtxJ4wElpSUZBkcHDzh9/vToxlA01syi1OFw2FmtVpdNputMpoBFSz+ZWcT95KnNWBtvPfe4XAwr9e7ob+/f4oBjjmq6NSdFhSFjYyMNHV0dBRNNoBKW5cBQoDyQIbP56udbEB1PCfAyaMACXELTYemv+Z/NzOIzGYzGxoaKm5vb7dFDFgIljEDCXVBBqbDvIgBaRJ2b/QwHRZHDIj8/46hBgHIjhhQZLDO00zAUBY7IwaUGs0Au93Oent7C0w8AZYZzQBaFyQkJKSSASVM3g6u5itjMqDKgAkwohQLXwHSbi/dvRk3UOep77bfAgwAst2xTAPm/mIAAAAASUVORK5CYII=';

    return (
      <div>
        <div>
          <Components.ProfilePicture style={ style } src={ undefined } title='Basic Icon' />
          <Components.ProfilePicture style={ style } src={ undefined } iconSize='2x' title='2x Size Icon' />
          <Components.ProfilePicture style={ style } src={ undefined } thumbnail title='Thumbnail Icon' />
          <Components.ProfilePicture style={ style } src={ undefined } iconSize='2x' thumbnail size={ 40 } title='Fixed Width/Height Icon' />
          <Components.ProfilePicture style={ style } src={ undefined } iconSize='2x' thumbnail rounded size={ 40 } title='Rounded Icon' />
          <Components.ProfilePicture style={ style } src={ imageData } title='Basic Image' />
          <Components.ProfilePicture style={ style } src={ imageData } rounded title='Rounded Image' />
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail title='Thumbnail Image' />
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail size={ 40} title='Fixed Width/Height Image' />
        </div>
        <div style={ ({ height: 250 }) }>
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail responsive title='Responsive Image' />
        </div>
      </div>
    );
  },
  ListViewModel: (viewModel: Components.ListViewModel<any, any>, componentRoute: string) => {
    switch (componentRoute) {
      case 'List':
        return (
          <Components.ListView viewModel={ viewModel } viewTemplate={ listTemplate } />
        );
      case 'ListCmd':
        return (
          <Components.ListView viewModel={ viewModel } viewTemplate={ listCmdTemplate } />
        );
      case 'Tree':
        return (
          <Components.ListView viewModel={ viewModel } selectable checkmarkSelected viewTemplate={ treeTemplate } />
        );
      case 'PanelList':
        return (
          <Panel header='List View Embedded Within a Panel' style={({ margin: 0 })}>
            <Components.ListView viewModel={ viewModel } selectable checkmarkSelected fill viewTemplate={ listTemplate } />
          </Panel>
        );
      default:
        return null;
    }
  },
  DataGridViewModel: (viewModel: Components.DataGridViewModel<any>, componentRoute: string) => {
    let view: Components.DataGridViewTemplate<SampleData> | undefined;
    let columns: any;
    let pager: any = true;
    let search = false;

    if (componentRoute === 'DataGridList') {
      pager = false;
      search = true;
      view = new Components.DataGridListViewTemplate<SampleData>(
        x => sampleDataTemplate(x),
      );
    }

    if (componentRoute === 'DataGridPager') {
      view = new Components.DataGridListViewTemplate<SampleData>(
        x => sampleDataTemplate(x),
      );

      // this is the simple method of overriding pager details
      pager = { order: [ 'controls', 'info' ] };
      // this method allows much more complex composition
      // pager = (<DataGridView.Pager grid={ viewModel } viewTemplate={ view } order={ [ null, 'info' ] } />);
    }

    if (componentRoute === 'DataGrid' || componentRoute === 'DataGridRoutingState') {
      search = true;
      columns = [
        <Components.DataGridColumn key='id' fieldName='id' header='ID' sortable
          tooltip={ (x: SampleData) => x == null ? null : (
            <Tooltip id={ `${ x.id }-id-tt` }>{ `Cells support tooltips: ${ x.id }` }</Tooltip>
          ) }
        />,
        <Components.DataGridColumn key='cat' fieldName='cat' header='Category' sortable />,
        <Components.DataGridColumn key='name' fieldName='name' header='Name' sortable
          tooltip={ (x: SampleData, index, column) => {
            if (x == null) {
              // header
              return (
                <Tooltip id='name-header-tt' placement='top'>{ `Headers can have tooltips too: ${ column.fieldName }` }</Tooltip>
              );
            }
            else {
              // cell
              return (
                <Popover id={ `${ x.id }-name-tt` } placement='left'>{ `You can use fancy popover tooltips: ${ x.name }` }</Popover>
              );
            }
          } }
        />,
        <Components.DataGridColumn key='requiredBy' fieldName='requiredBy' header='Required By' sortable width={ 250 }
          tooltip={ (x: SampleData) => x == null ? null : (
            <OverlayTrigger placement='top'
              overlay={ <Tooltip id={ `${ x.id }-requiredBy-tt` }>Even completely custom overlay triggers: { x.requiredBy }</Tooltip> }
            />
          ) }
        />,
        <Components.NavDataGridColumn key='nav' buttonProps={ (x: SampleData) => ({ href: `#/name/${ x.name }` }) } />,
      ];
    }

    return (
      <Components.DataGridView key={ componentRoute } viewModel={ viewModel } viewTemplate={ view } pager={ pager } search={ search }>
        { columns }
      </Components.DataGridView>
    );
  },
  AsyncDataGridViewModel: (viewModel: Components.AsyncDataGridViewModel<any, any, any>) => (
    <Components.DataGridView viewModel={ viewModel } pager={ ({ limits: [ 1, 5, 10, null ] }) }>
      <Components.DataGridColumn key='name' fieldName='name' header='Name' sortable />
      <Components.DataGridColumn key='requiredBy' fieldName='requiredBy' header='Required By' sortable width={ 250 } />
    </Components.DataGridView>
  ),
  ModalDialogViewModel: (data: { viewModel: Readonly<Components.ModalDialogViewModel<string>>, createContext: Command<string>, accept: Command<any>, reject: Command<any> }) => (
    <div>
      <Button onClick={ wxr.bindEventToCommand(data.viewModel, x => data.createContext, () => 'You can put custom content here') }>Show Confirmation Dialog</Button>
      <Components.ModalDialogView viewModel={ data.viewModel } title='Demo Modal Confirmation Dialog' body={ () => data.viewModel.context.value } bsSize='lg'>
        <Components.CommandButton bsStyle='primary' command={ data.viewModel.hideOnExecute(data.accept) } commandParameter={ () => data.viewModel.context.value }>Accept</Components.CommandButton>
        <Components.CommandButton bsStyle='danger' command={ data.viewModel.hideOnExecute(data.reject) } commandParameter={ () => data.viewModel.context.value }>Reject</Components.CommandButton>
        <Components.CommandButton bsStyle='default' command={ data.viewModel.hide }>Cancel</Components.CommandButton>
      </Components.ModalDialogView>
    </div>
  ),
  TabsViewModel: (viewModel: Components.TabsViewModel<any>, componentRoute: string) => {
    if (componentRoute === 'StaticTabs') {
      return (
        <Components.TabsView viewModel={viewModel} id='demo-tabs'>
          <Tab title='First Static Tab'><Well style={({ margin: 0 })}>Content 1</Well></Tab>
          <Tab title='Second Static Tab'><Well style={({ margin: 0 })}>Content 2</Well></Tab>
        </Components.TabsView>
      );
    }
    else {
      let c = 0;

      const template = new Components.TabRenderTemplate<any>((x, i) => `Tab ${ x }`, (x, i, vm) => (
        <Button style={({ width: '100%', marginTop: 10 })} onClick={ () => { vm.removeTab.execute(i); } }>
          { `Close Tab ${ x }` }
        </Button>
      ));

      return (
        <div>
          <Button style={({ width: '100%', marginBottom: 10 })} onClick={() => { viewModel.addTab.execute(++c); } }>
            Create Tab
          </Button>
          <Components.TabsView viewModel={ viewModel } id='demo-tabs' template={ template } />
        </div>
      );
    }
  },
  CommonPanel: () => (
    <Components.CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      Add any content to the panel body!
      <Components.Loading fontSize={ 24 } text='Such as a Loader...' />
      <Button onClick={() => Alert.create('Button Clicked', 'Common Panel Demo')}>Or Even a Button</Button>
    </Components.CommonPanel>
  ),
  CommonPanelList: () => (
    <Components.CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      <ListGroup fill>
        <ListGroupItem>Item 1</ListGroupItem>
        <ListGroupItem>Item 2</ListGroupItem>
        <ListGroupItem>Item 3</ListGroupItem>
      </ListGroup>
    </Components.CommonPanel>
  ),
  CommonPanelTable: () => (
    <Components.CommonPanel headerContent='Common Panel Demo' footerContent='Add Status Content to the Footer' collapsible
      headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
      footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
    >
      <Table fill>
        <thead><tr><th>Some Column</th></tr></thead>
        <tbody><tr><td>Row Data!</td></tr></tbody>
      </Table>
    </Components.CommonPanel>
  ),
  CommonPanelTest: () => (
    <div>
      <Components.CommonPanel
        headerContent='Basic'
        footerContent='no buttons'
      />
      <Components.CommonPanel style={({ marginTop: 5 })}
        headerContent='No Footer'
      />
      <Components.CommonPanel style={({ marginTop: 5 })}
        footerContent='no header'
      />
      <Components.CommonPanel style={({ marginTop: 5 })}
        headerContent='Footer only button'
        footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' } ]}
      />
      <Components.CommonPanel style={({ marginTop: 5 })}
        headerContent='Basic with buttons'
        footerContent='header and footer and buttons'
        headerActions={[ { id: 'header-action-1', children: 'Header Button 1' } ]}
        footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' } ]}
      />
      <Components.CommonPanel style={({ marginTop: 5 })} collapsible
        headerContent='Collapsible with buttons'
        footerContent='collapsible header and footer and buttons'
        headerActions={[ { id: 'header-action-1', children: 'Header Button 1' } ]}
        footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' } ]}
      >
        Content
      </Components.CommonPanel>
      <Components.CommonPanel style={({ marginTop: 5 })}
        headerContent='Long text -- asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf'
        footerContent='long header, long footer with buttons -- asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf'
        headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
        footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
      />
      <Components.CommonPanel style={({ marginTop: 5 })} collapsible
        headerContent='Collapsible Long text -- asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf'
        footerContent='long collapsible header, long footer with buttons -- asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf sadf asdf'
        headerActions={[ { id: 'header-action-1', children: 'Header Button 1' }, { id: 'header-action-2', children: 'Header Button 2' } ]}
        footerActions={[ { id: 'footer-action-1', children: 'Footer Button 1' }, { id: 'footer-action-2', children: 'Footer Button 2' } ]}
      >
        Content
      </Components.CommonPanel>
    </div>
  ),
  ItemListPanelViewModel: (viewModel: Components.ItemListPanelViewModel<any>, componentRoute: string) => {
    if (componentRoute === 'ItemListPanel') {
      return (
        <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Grid Data' collapsible pager search
          headerActions={[ { id: 'header', children: 'Header Action' } ]}
          footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
          footerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'ItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
        >
          <Components.DataGridColumn key='id' fieldName='id' header='ID' sortable />,
          <Components.DataGridColumn key='cat' fieldName='cat' header='Category' sortable />,
          <Components.DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
          <Components.DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
          <Components.NavDataGridColumn buttonProps={ (x: SampleData) => ({ href: `#/name/${ x.name }` }) } />
        </Components.ItemListPanelView>
      );
    }
    else if (componentRoute === 'TreeItemListPanel') {
      return (
        <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Tree Data' collapsible
          headerActions={[ { id: 'header', children: 'Header Action' } ]} viewTemplate={ treeTemplate }
          footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
          footerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'ItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
        >
        </Components.ItemListPanelView>
      );
    }
    else {
      return (
        <Components.ItemListPanelView viewModel={ viewModel } headerContent='Sample List Data' collapsible pager search
          viewTemplate={
            new Components.DataGridListViewTemplate<SampleData>(
              x => `Name: ${ x.name }, Required By: ${ x.requiredBy }`,
            )
          }
        >
        </Components.ItemListPanelView>
      );
    }
  },
  AsyncItemListPanelViewModel: (viewModel: Components.AsyncItemListPanelViewModel<any, any, any>) => (
    <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Data' collapsible pager
      headerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'AsyncItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
      footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
      footerActions={[ { id: 'refresh', command: viewModel.grid.refresh, children: 'Refresh' } ]}
    >
      <Components.DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
      <Components.DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
    </Components.ItemListPanelView>
  ),
  InlineEditViewModel: (viewModel: Components.InlineEditViewModel<any>, componentRoute: string) => {
    if (componentRoute === 'InlineEditObject') {
      return (
        <Components.InlineEditView style={ ({ margin: 0 }) } viewModel={ viewModel } inputType='number'
          template={ x => `${ x.rank } of 10` } converter={ x => Number(x) } keyboard clickToEdit
          valueGetter={ (x: Property<any>) => x.value.rank } valueSetter={ (x: Property<any>, v) => x.value.rank = v }
        />
      );
    }
    else {
      return (
        <Components.InlineEditView style={ ({ margin: 0 }) } viewModel={ viewModel } inputType='number'
          template={ x => `${ x } of 10` } converter={ x => Number(x) } keyboard clickToEdit
        />
      );
    }
  },
  TodoListViewModel: (viewModel: TodoListViewModel) => (
    <TodoListView style={({ padding: 20 })} viewModel={ viewModel } shadow />
  ),
  Help: () => {
    const helpStyle: (top?: number, left?: number, textAlign?: string, zIndex?: number) => React.CSSProperties = (top = 0, left = 0, textAlign = 'center', zIndex = 1000) => ({
      display: 'inline-block',
      position: 'absolute',
      textAlign,
      zIndex,
      top,
      left,
    });

    const helpItem = (text: string, top = 0, left = 0, iconName = 'arrow-up', textAlign = 'center', zIndex = 1000) => (
      <div style={ helpStyle(top, left, textAlign, zIndex) }>
        <div>
          <Icon name={ iconName } />
        </div>
        <div>{ text }</div>
      </div>
    );

    return (
      <div>
        { helpItem('Click to reveal the sidebar menu', 50, 10) }
        { helpItem('A todo list example in the sidebar menu', 100, 350, 'arrow-left', 'left') }
        { helpItem('Some simple react component demos', 50, 330) }
        { helpItem('Some webrx-react component demos', 10, 690, 'arrow-left', 'left', 1039) }
        { helpItem('Simulate bootstrap grid size', 100, 1190, 'arrow-right', 'right') }
      </div>
    );
  },
};

// inject the component demo into the app view map
AppViewMap['ComponentDemoViewModel'] = (viewModel: ComponentDemoViewModel) => (
  <ComponentDemoView viewModel={ viewModel } viewMap={ demoViewMap } />
);
