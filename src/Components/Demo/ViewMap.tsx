import * as React from 'react';
import { Observable } from 'rxjs';
import { Icon } from 'react-fa';
import { Col, Form, FormGroup, InputGroup, FormControl, Button, MenuItem, Panel, Tab,
  Well, ListGroup, ListGroupItem, Table, OverlayTrigger, Overlay, Tooltip, Popover, Label,
} from 'react-bootstrap';

import { Property, Command } from '../../WebRx';
import { Logging, Alert } from '../../Utils';
import { wxr } from '../React';
import { SampleData, SampleTreeData, sampleListData, sampleTreeData } from './RoutingMap';
import * as Components from '../Common';
// import { TodoListView } from './TodoList/TodoListView';
// import { TodoListViewModel } from './TodoList/TodoListViewModel';
import { ComponentDemoViewModel } from './ComponentDemoViewModel';
import { ComponentDemoView, ViewActivatorMap } from './ComponentDemoView';
import { ViewMap as AppViewMap } from '../../Routing';

const logger = Logging.getLogger('Demo.ViewMap');

const sampleDataTemplate = (x: SampleData) => {
  return (
    <div key={ x.id }>
      <div>
        <span>Name: </span><span>{ x.name }</span>
      </div>
      <div>
        <span>Required By: </span><span>{ x.requiredBy }</span>
      </div>
    </div>
  );
};

const sampleDataCmdTemplate = (x: SampleData) => {
  return (
    <Components.CommandButton block plain stopPropagation={ false } href='#' style={ ({ padding: 5 }) }>
      { sampleDataTemplate(x) }
    </Components.CommandButton>
  );
};

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
              command={Components.CommandButton.wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
              tooltip='Embedded Command Tooltips!!!'
            >
              Execute Command
            </Components.CommandButton>
            <Components.CommandButton bsSize='large'
              commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={Components.CommandButton.wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
              tooltip={ (<Popover id='cmd-btn-custom-tt' placement='top'>Custom Tooltip</Popover>) }
            >
              Same Command
            </Components.CommandButton>
            <Components.CommandButton bsSize='large'
              commandParameter={() => ((document.getElementById('CommandButtonParamInput') || {}) as HTMLInputElement).value }
              command={Components.CommandButton.wx.command(x => Alert.create(x, 'CommandButton Pressed'))}
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
    <Components.ObservableWrapper observable={ Observable.timer(0, 1000) } render={ x => (<div>Current Value is { x }</div>) } />
  ),
  SearchViewModel: (viewModel: Components.SearchViewModel) => (
    <Form horizontal onSubmit={ () => false }>
      <FormGroup style={ ({ marginBottom: 0 }) }>
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
        </div>
        <div>
          <Components.ProfilePicture style={ style } src={ imageData } title='Basic Image' />
          <Components.ProfilePicture style={ style } src={ imageData } rounded title='Rounded Image' />
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail title='Thumbnail Image' />
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail size={ 40} title='Fixed Width/Height Image' />
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail rounded size={ 40 } title='Rounded Image' />
        </div>
        <div>
          <Components.ProfilePicture style={ style } src='http://via.placeholder.com/50x30' title='Wide Image' />
          <Components.ProfilePicture style={ style } src='http://via.placeholder.com/30x50' title='Tall Image' />
          <Components.ProfilePicture style={ style } src='http://via.placeholder.com/100x60' title='X-Wide Image' />
          <Components.ProfilePicture style={ style } src='http://via.placeholder.com/60x100' title='X-Tall Image' />
        </div>
        <div style={ ({ height: 250 }) }>
          <Components.ProfilePicture style={ style } src={ imageData } thumbnail responsive title='Responsive Image' />
        </div>
      </div>
    );
  },
  ItemsPanel: () => (
    <Components.ItemsPresenter>
      <Label>Item 1</Label>
      <Label>Item 2</Label>
      <Label>Item 3</Label>
    </Components.ItemsPresenter>
  ),
  ItemsPanelBound: () => (
    <Components.ItemsPresenter
      itemsSource={ sampleListData }
      itemTemplate={ (x: SampleData) => x.name }
    />
  ),
  ListGroupPanel: () => (
    <Components.ListGroupPanel>
      <Label>Item 1</Label>
      <Label>Item 2</Label>
      <Label>Item 3</Label>
    </Components.ListGroupPanel>
  ),
  ListGroupPanelBound: () => (
    <Components.ItemsPresenter itemsSource={ sampleListData } itemTemplate={ sampleDataTemplate }>
      <Components.ListGroupPanel />
    </Components.ItemsPresenter>
  ),
  GridPanel: () => (
    <Components.Grid border style={({ height: 400 })}>
      <Components.Grid.Rows>
        <Components.RowDefinition height={ 100 } />
        <Components.RowDefinition height={ 200 } />
        <Components.RowDefinition />
      </Components.Grid.Rows>
      <Components.Grid.Columns itemClassName={ ctx => `Col-${ ctx.column }` } itemStyle={({ verticalAlign: 'middle' })}>
        <Components.ColumnDefinition width={ 200 } />
        <Components.ColumnDefinition width='2*' />
        <Components.ColumnDefinition />
      </Components.Grid.Columns>
      <div data-grid-row={ 0 } data-grid-column={ 0 }>(0, 0): [ 200px width, 100px height ]</div>
      <div data-grid-row={ 0 } data-grid-column={ 1 }>(1, 0): [ 2x stretch width, 100px height ]</div>
      <div data-grid-row={ 0 } data-grid-column={ 2 }>(2, 0): [ 1x stretch width, 100px height ]</div>
      <div data-grid-row={ 1 } data-grid-column={ 0 }>(0, 1): [ 200px width, 200px height ]</div>
      <div data-grid-row={ 1 } data-grid-column={ 1 }>(1, 1): [ 2x stretch width, 200px height ]</div>
      <div data-grid-row={ 1 } data-grid-column={ 2 }>(2, 1): [ 1x stretch width, 200px height ]</div>
      <div data-grid-row={ 2 } data-grid-column={ 0 }>(0, 2): [ 200px width, 1x stretch height ]</div>
      <div data-grid-row={ 2 } data-grid-column={ 1 }>(1, 2): [ 2x stretch width, 1x stretch height ]</div>
      <div data-grid-row={ 2 } data-grid-column={ 2 }>(2, 2): [ 1x stretch width, 1x stretch height ]</div>
    </Components.Grid>
  ),
  StackPanel: () => (
    <div>
      <Components.StackPanel orientation='Horizontal' itemStyle={({ marginRight: 5 })}>
        <Label>Item 1</Label>
        <Label>Item 2</Label>
        <Label>Item 3</Label>
      </Components.StackPanel>
      <Components.StackPanel itemStyle={({ marginBottom: 5 })}>
        <Label>Item 1</Label>
        <Label>Item 2</Label>
        <Label>Item 3</Label>
      </Components.StackPanel>
    </div>
  ),
  UniformGridPanel: () => (
    <Components.UniformGridPanel gridRows={ 3 } gridColumns={ 2 } border renderEmptyRows
      columnStyle={({ height: 50, verticalAlign: 'middle' })}
    >
      <Label key={ 1 }>Item 1</Label>
      <Label key={ 2 }>Item 2</Label>
      <Label key={ 3 }>Item 3</Label>
    </Components.UniformGridPanel>
  ),
  WrapPanel: () => (
    <Components.WrapPanel itemStyle={({ marginRight: 5 })}>
      <Label>Item 1</Label>
      <Label>Item 2</Label>
      <Label>Item 3</Label>
    </Components.WrapPanel>
  ),
  NavButton: () => {
    return (
      <div>
        <Components.NavButton />
        <Components.NavButton href='#' />
        <Components.NavButton href='#'>
          testing
        </Components.NavButton>
        <Components.NavButton href='#'>
          <div>
            <Label>Item 1</Label>
          </div>
        </Components.NavButton>
        <Components.NavButton href='#'>
          <div>
            <Label>Item 2</Label>
          </div>
          <div>
            <Label>Item 3</Label>
          </div>
        </Components.NavButton>
      </div>
    );
  },
  TreeItem: () => (
    <Components.TreeItem
      item={ sampleTreeData[0] }
      index={ 0 }
      itemsSource={ (x: SampleTreeData) => x.items }
      itemTemplate={ (x: SampleTreeData) => x.name }
      startExpanded
    />
  ),
  TreeItemPresenter: () => (
    <Components.ItemsPresenter
      itemsSource={ sampleTreeData }
      itemTemplate={ (item: SampleTreeData, i) => (
        <Components.TreeItem
          item={ item }
          index={ i }
          itemsSource={ (x: SampleTreeData) => x.items }
          itemTemplate={ (x: SampleTreeData) => x.name }
          startExpanded
        />
      )}
    />
  ),
  HorizontalTreeItemPresenter: () => (
    <Components.ItemsPresenter
      itemsSource={ sampleTreeData }
      itemsPanelTemplate={ x => <Components.StackPanel orientation='Horizontal'>{ x }</Components.StackPanel> }
      itemTemplate={ (item: SampleTreeData, i) => (
        <Components.TreeItem
          item={ item }
          index={ i }
          itemsSource={ (x: SampleTreeData) => x.items }
          itemsPanelTemplate={ x => <Components.StackPanel orientation='Horizontal'>{ x }</Components.StackPanel> }
          itemTemplate={ (x: SampleTreeData) => x.name }
        />
      )}
    />
  ),
  HorizontalItemsTreeItemPresenter: () => (
    <Components.ItemsPresenter
      itemsSource={ sampleTreeData }
      itemTemplate={ (item: SampleTreeData, i) => (
        <Components.TreeItem
          item={ item }
          index={ i }
          itemsSource={ (x: SampleTreeData) => x.items }
          itemsPanelTemplate={ x => <Components.StackPanel orientation='Horizontal'>{ x }</Components.StackPanel> }
          itemTemplate={ (x: SampleTreeData) => x.name }
        />
      )}
    />
  ),
  HorizontalRootTreeItemPresenter: () => (
    <Components.ItemsPresenter
      itemsSource={ sampleTreeData }
      itemsPanelTemplate={ x => <Components.StackPanel orientation='Horizontal'>{ x }</Components.StackPanel> }
      itemTemplate={ (item: SampleTreeData, i) => (
        <Components.TreeItem
          item={ item }
          index={ i }
          itemsSource={ (x: SampleTreeData) => x.items }
          itemTemplate={ (x: SampleTreeData) => x.name }
        />
      )}
    />
  ),
  ItemsViewModel: (viewModel: Components.ItemsViewModel<{}>, componentRoute: string) => {
    switch (componentRoute) {
      case 'ItemsList':
        return (
          <Components.ItemsView
            viewModel={ viewModel }
            itemTemplate={ (x: SampleData) => sampleDataTemplate(x) }
            itemStyle={ ({ textAlign: 'left' }) }
          />
        );
      case 'ItemsWrap':
        return (
          <Components.ItemsView
            viewModel={ viewModel }
            itemTemplate={ (x: SampleData) => (<Label key={ x.id } style={({ marginRight: 5 })}>{ `name = ${ x.name }, requiredBy = ${ x.requiredBy }` }</Label>) }
          >
            <Components.WrapPanel />
          </Components.ItemsView>
        );
      case 'ItemsUGrid':
        return (
          <Components.ItemsView
            style={({ height: 400 })}
            viewModel={ viewModel }
            itemTemplate={ sampleDataTemplate }
            compact
          >
            <Components.UniformGridPanel
              gridRows={ 4 } gridColumns={ 4 } firstColumn={ 1 } border renderEmptyRows
              rowStyle={({ height: 100 })}
              columnStyle={({ verticalAlign: 'middle' })}
            />
          </Components.ItemsView>
        );
      case 'ItemsHStack':
        return (
          <Components.ItemsView
            viewModel={ viewModel }
            itemTemplate={ (x: SampleData) => (<Label key={ x.id } style={({ marginRight: 5 })}>{ `name = ${ x.name }, requiredBy = ${ x.requiredBy }` }</Label>) }
          >
            <Components.StackPanel orientation='Horizontal' />
          </Components.ItemsView>
        );
      case 'ItemsGrid':
        return (
          <Components.ItemsView
            style={({ height: 400 })}
            viewModel={ viewModel }
            itemTemplate={ (x: SampleData, i: number) => {
              const row = Math.floor(i / 3) % 3;
              const col = (row + i) % 3;

              return (
                <div key={ i } data-grid-row={ row } data-grid-column={ col }>{ x.name }</div>
              );
            } }
            compact
          >
            <Components.Grid border>
              <Components.Grid.Rows>
                <Components.RowDefinition height={ 100 } />
                <Components.RowDefinition height={ 200 } />
                <Components.RowDefinition />
              </Components.Grid.Rows>
              <Components.Grid.Columns itemStyle={({ verticalAlign: 'middle' })}>
                <Components.ColumnDefinition width={ 100 } />
                <Components.ColumnDefinition width='2*' />
                <Components.ColumnDefinition />
              </Components.Grid.Columns>
            </Components.Grid>
          </Components.ItemsView>
        );
      case 'ItemsTree':
        return (
          <Components.TreeItemsView
            viewModel={ viewModel }
            itemsSource={ (x: SampleTreeData) => x.items }
            itemTemplate={ (x: SampleTreeData) => sampleDataTemplate(x) }
            expandedIconName='caret-down'
            collapsedIconName='caret-right'
          />
        );
      default:
        return null;
    }
  },
  ListItemsViewModel: (viewModel: Components.ListItemsViewModel<{}>, componentRoute: string) => {
    const a: React.ReactElement<Components.ListGroupPanelProps> = (<Components.ListGroupPanel />);
    switch (componentRoute) {
      case 'ListItemsDefault':
        return (
          <Components.ListItemsView viewModel={ viewModel } />
        );
      case 'ListItemsListGroup':
        return (
          <Components.ListItemsView viewModel={ viewModel } itemTemplate={ sampleDataTemplate }>
            <Components.ListGroupView itemsProps={({ viewTemplate: x => (<div style={({ padding: 10, backgroundColor: 'blue' })}>{ x }</div>) })} />
          </Components.ListItemsView>
        );
      case 'ListItemsPanel':
        return (
          <Components.ListItemsView viewModel={ viewModel } itemTemplate={ sampleDataTemplate }>
            <Components.PanelView />
          </Components.ListItemsView>
        );
      case 'ListItemsUGrid':
        return (
          <Components.ListItemsView viewModel={ viewModel } itemTemplate={ sampleDataTemplate }>
            <Components.PanelView>
              <Components.UniformGridPanel gridRows={ 4 } gridColumns={ 4 } />
            </Components.PanelView>
          </Components.ListItemsView>
        );
      case 'ListItemsGrid':
        return (
          <Components.ListItemsView viewModel={ viewModel }>
            <Components.GridView>
              <Components.GridViewColumn header='Id' cellTemplate={ (x: SampleData) => x.id } />
              <Components.GridViewColumn header='Category' cellTemplate={ (x: SampleData) => x.cat } />
              <Components.GridViewColumn header='Name' cellTemplate={ (x: SampleData) => x.name } />
              <Components.GridViewColumn header='Required By' cellTemplate={ (x: SampleData) => (<div>{ x.requiredBy }</div>) } />
            </Components.GridView>
          </Components.ListItemsView>
        );
      case 'ListItemsGridAuto':
        return (
          <Components.ListItemsView viewModel={ viewModel } view={ (<Components.GridView />) } />
        );
      case 'ListItemsTree':
        return (
          <Components.ListItemsView viewModel={ viewModel } itemTemplate={ sampleDataTemplate }>
            <Components.TreeView itemsSource={ (x: SampleTreeData) => x.items } />
          </Components.ListItemsView>
        );
      default:
        return null;
    }
  },
  ModalDialogViewModel: (data: { viewModel: Components.ModalDialogViewModel<string>, createContext: Command<string>, accept: Command<any>, reject: Command<any> }) => (
    <div>
      <Button onClick={ wxr.bindEventToCommand(data.viewModel, x => data.createContext, () => 'You can put custom content here') }>Show Confirmation Dialog</Button>
      <Components.ModalDialogView viewModel={ data.viewModel } modalTitle='Demo Modal Confirmation Dialog' modalBody={ () => data.viewModel.context.value } bsSize='lg'>
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
  DataGridViewModel: (viewModel: Components.DataGridViewModel<{}>, componentRoute: string) => {
    switch (componentRoute) {
      case 'DataGrid':
        return (
          <Components.DataGridView viewModel={ viewModel } pager>
            <Components.GridViewColumn field='id' cellTooltipTemplate={ (x: SampleData) => `Item ${ x.id }` } />
            <Components.GridViewColumn id='cat' header='Category' cellTemplate={ (x: SampleData) => x.cat } headerTooltipTemplate='Simple Header Tooltip' />
            <Components.GridViewColumn field='requiredBy' header='Required By' cellTooltipTemplate={ (x: SampleData) => (<Components.ContentTooltip content={ `Popover Content for ${ x.name }` } title='Fancy Tooltip' />) } />
            <Components.GridViewColumn id='name' header='Name' cellTemplate={ (x: SampleData) => (<a href='#'>{ x.name }</a>) } headerTooltipTemplate={(<Components.ContentTooltip content='Fancy Header Popover' popover placement='top' />)} />
          </Components.DataGridView>
        );
      case 'DataGridAutoCol':
        return (
          <Components.DataGridView viewModel={ viewModel } pager />
        );
      case 'DataGridNoPager':
        // we are also using a custom grid view here that doesn't render column headers as buttons
        return (
          <Components.DataGridView viewModel={ viewModel }>
            <Components.GridView />
          </Components.DataGridView>
        );
      case 'DataGridPager':
        // this is the simple method of overriding pager details
        const pager = { order: [ 'controls', 'info' ] };
        // this method allows much more complex composition
        // const pager = (<Components.PagerView viewModel={ viewModel.pager } order={ [ undefined, 'info' ] } />);

        return (
          <Components.DataGridView viewModel={ viewModel } pager={ pager } />
        );
      case 'DataGridList':
        return (
          <Components.DataGridView viewModel={ viewModel } itemTemplate={ sampleDataCmdTemplate } pager compact>
            <Components.ListGroupView />
          </Components.DataGridView>
        );
      case 'DataGridUGrid':
        return (
          <Components.DataGridView viewModel={ viewModel } itemTemplate={ sampleDataTemplate } pager>
            <Components.PanelView>
              <Components.UniformGridPanel gridRows={ 5 } gridColumns={ 2 } />
            </Components.PanelView>
          </Components.DataGridView>
        );
      default:
        return null;
    }
  },
  AsyncDataGridViewModel: (viewModel: Components.AsyncDataGridViewModel<{}>, componentRoute: string) => {
    switch (componentRoute) {
      case 'DataGridAsync':
        return (
          <Components.DataGridView viewModel={ viewModel } pager />
        );
      default:
        return null;
    }
  },
  // ItemListPanelViewModel: (viewModel: Components.ItemListPanelViewModel<any>, componentRoute: string) => {
  //   if (componentRoute === 'ItemListPanel') {
  //     return (
  //       <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Grid Data' collapsible pager search
  //         headerActions={[ { id: 'header', children: 'Header Action' } ]}
  //         footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
  //         footerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'ItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
  //       >
  //         <Components.DataGridColumn key='id' fieldName='id' header='ID' sortable />,
  //         <Components.DataGridColumn key='cat' fieldName='cat' header='Category' sortable />,
  //         <Components.DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
  //         <Components.DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
  //         <Components.NavDataGridColumn buttonProps={ (x: SampleData) => ({ href: `#/name/${ x.name }` }) } />
  //       </Components.ItemListPanelView>
  //     );
  //   }
  //   else if (componentRoute === 'TreeItemListPanel') {
  //     return (
  //       <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Tree Data' collapsible
  //         headerActions={[ { id: 'header', children: 'Header Action' } ]} viewTemplate={ treeTemplate }
  //         footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
  //         footerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'ItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
  //       >
  //       </Components.ItemListPanelView>
  //     );
  //   }
  //   else {
  //     return (
  //       <Components.ItemListPanelView viewModel={ viewModel } headerContent='Sample List Data' collapsible pager search
  //         viewTemplate={
  //           new Components.DataGridListViewTemplate<SampleData>(
  //             x => `Name: ${ x.name }, Required By: ${ x.requiredBy }`,
  //           )
  //         }
  //       >
  //       </Components.ItemListPanelView>
  //     );
  //   }
  // },
  // AsyncItemListPanelViewModel: (viewModel: Components.AsyncItemListPanelViewModel<any, any, any>) => (
  //   <Components.ItemListPanelView viewModel={viewModel} headerContent='Sample Data' collapsible pager
  //     headerActions={[ { id: 'viewall', bsStyle: 'primary', command: wx.command(x => Alert.create(x, 'View All Pressed')), commandParameter: 'AsyncItemListPanel', children: (<Components.ViewAllFooterAction suffix='Things' />) } ]}
  //     footerContent={ (<Components.CountFooterContent length={viewModel.lengthChanged} suffix='Things' />) }
  //     footerActions={[ { id: 'refresh', command: viewModel.grid.refresh, children: 'Refresh' } ]}
  //   >
  //     <Components.DataGridColumn fieldName='name' header='Name' sortable className='col-md-8' />
  //     <Components.DataGridColumn fieldName='requiredBy' header='Required By' sortable className='col-md-4' />
  //   </Components.ItemListPanelView>
  // ),
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
  // TodoListViewModel: (viewModel: TodoListViewModel) => (
  //   <TodoListView style={({ padding: 20 })} viewModel={ viewModel } shadow />
  // ),
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
