import * as React from 'react';
import * as classNames from 'classnames';
import { Icon } from 'react-fa';
import { Table, TableProps, ListGroup, ListGroupItem } from 'react-bootstrap';

import { BaseView, BaseViewProps, ViewModelProps } from '../../React/BaseView';
import { SearchView, SearchProps } from '../Search/SearchView';
import { PagerView, PagerProps } from '../Pager/PagerView';
import { CommandButton } from '../CommandButton/CommandButton';
import { bindEventToCommand } from '../../React/BindingHelpers';
import { renderConditional } from '../../React/RenderHelpers';
import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';
import { NavButton, NavButtonProps } from '../List/NavButton';

import './DataGrid.less';

type ColumnRenderFunction = (
  item: any,
  index: number,
  column: DataGridColumnProps,
  columnIndex: number,
  columns: DataGridColumnProps[],
  viewModel: DataGridViewModel<any>,
  view: DataGridView,
) => any;

export interface DataGridColumnProps {
  fieldName: string;
  header?: string;
  sortable?: boolean;
  className?: string;
  width?: number | string;
  renderCell?: ColumnRenderFunction;
}

export class DataGridColumn extends React.Component<DataGridColumnProps, any> {
  public static displayName = 'DataGridColumn';

  static defaultProps = {
  };
}

interface NavDataGridColumnProps extends NavButtonProps {
  header?: string;
  width?: number | string;
  renderCell?: ColumnRenderFunction;
}

export class NavDataGridColumn extends React.Component<NavDataGridColumnProps, any> {
  public static displayName = 'NavDataGridColumn';

  static defaultProps = {
    fieldName: 'nav',
    header: '',
    className: 'navColumn',
    width: 1,
    renderCell: (x: any, i: number, c: NavDataGridColumnProps) => {
      const { rest } = Object.rest(c as any, d => {
        const { fieldName, header, className, width, renderCell } = d;
        return { fieldName, header, className, width, renderCell };
      });

      return (
        <NavButton { ...rest } />
      );
    },
  };
}

export interface DataGridViewTemplate<T> {
  render: (viewModel: DataGridViewModel<T>, view: DataGridView) => any;
}

export class DataGridListViewTemplate<T> implements DataGridViewTemplate<T> {
  public static displayName = 'DataGridListViewTemplate';

  constructor(
    protected renderItem: (item: T, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) => any = x => x,
    protected keySelector: (item: T, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) => any = (r, i) => i,
    protected renderItemContainer?: (contents: any, item: T, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) => any
  ) {
    this.renderItemContainer = this.renderItemContainer || this.defaultRenderItemContainer;
  }

  render(viewModel: DataGridViewModel<T>, view: DataGridView) {
    return (
      <ListGroup className='DataGrid-listView'>
        {
          (viewModel.projectedItems() || [])
            .asEnumerable()
            .map((x, i) =>
              this.renderItemContainer(
                this.renderItem(x, i, viewModel, view),
                x,
                i,
                viewModel,
                view
              )
            )
            .defaultIfEmpty(
              <ListGroupItem key='rows-empty' className='DataGrid-empty text-muted'>List is Empty...</ListGroupItem>
            )
            .toArray()
        }
      </ListGroup>
    );
  }

  protected defaultRenderItemContainer(contents: any, item: T, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) {
    return (
      <ListGroupItem className='DataGrid-row' key={ this.keySelector(item, index, viewModel, view) } active={ view.props.highlightSelected === true && viewModel.selectedItem() === item }>
        <div className='DataGrid-rowContainer' onClick={ bindEventToCommand(this, viewModel, x => x.selectItem, x => item) }>
          { contents }
        </div>
      </ListGroupItem>
    );
  }
}

export class DataGridTableViewTemplate<T> implements DataGridViewTemplate<T> {
  public static displayName = 'DataGridTableViewTemplate';

  private tableProps: TableProps;

  constructor(
    protected renderItem: (item: T, column: DataGridColumnProps, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) => any = x => x,
    protected rowKeySelector: (item: T, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) => any = (r, i) => i,
    protected enableAutomaticColumns = true,
    bordered = true, hover = true, striped = false, condensed = true, responsive = true
  ) {
    this.tableProps = { bordered, hover, striped, condensed, responsive };
  }

  protected getColumnDefinitions(viewModel: DataGridViewModel<T>, view: DataGridView) {
    let children = view.props.children;

    if (this.enableAutomaticColumns === true && React.Children.count(children) === 0) {
      const items = (viewModel.items() || []);

      if (items.length > 0 && items[0] != null) {
        // auto-generate columns
        children = Object
          .keys(items[0])
          .map(x => (
            <DataGridColumn fieldName={ x } />
          )) as any;
      }
    }

    return children;
  }

  protected createColumns(viewModel: DataGridViewModel<T>, view: DataGridView) {
    let columns: DataGridColumnProps[] = null;

    const columnDefinitions = this.getColumnDefinitions(viewModel, view);

    if (React.Children.count(columnDefinitions) > 0) {
      columns = React.Children
        .map(columnDefinitions, x => x)
        .filter(x => x != null)
        .map((x: React.ReactElement<DataGridColumnProps>) => {
          const column = Object.assign<DataGridColumnProps>({}, x.props);

          if (column.header == null) {
            column.header = column.fieldName;
          }

          if (column.renderCell == null) {
            column.renderCell = ((item: any) => item[column.fieldName]);
          }

          return column;
        });
    }

    return columns;
  }

  render(viewModel: DataGridViewModel<T>, view: DataGridView) {
    const columns = this.createColumns(viewModel, view);

    // const bordered = view.isOnlyView() === true ? false : this.tableProps.bordered;
    const props = Object.assign({}, this.tableProps, {
      bordered: view.isOnlyView() === true ? false : this.tableProps.bordered,
    });

    return (
      <Table className='DataGrid-tableView' { ...props }>
        <thead>{ this.renderColumns(columns, viewModel, view) }</thead>
        <tbody>{ this.renderRows(columns, viewModel, view) }</tbody>
      </Table>
    );
  }

  protected renderColumns(columns: DataGridColumnProps[], viewModel: DataGridViewModel<T>, view: DataGridView) {
    return (
      <tr>
        {
          (columns || [])
            .asEnumerable()
            .map((x, i) => this.renderColumnHeader(x, i, viewModel, view))
            .defaultIfEmpty(
              <th key='empty'>
                <div key='columns-empty' className='DataGrid-empty text-muted'>No Columns Defined...</div>
              </th>
            )
            .toArray()
        }
      </tr>
    );
  }

  protected renderColumnHeader(column: DataGridColumnProps, index: number, viewModel: DataGridViewModel<T>, view: DataGridView) {
    const sortIcon = this.renderSortIcon(column, index, viewModel, view);

    const headerContent = (
      <span className='DataGrid-columnHeader'>
        { column.header }
      </span>
    );

    return (
      <th key={ index } className={ classNames('DataGrid-column', column.className) } width={ column.width }>
        {
          renderConditional(sortIcon == null, () => (
            <div className='DataGrid-columnContainer'>{ headerContent }</div>
          ), () => (
            <CommandButton className='DataGrid-columnContainer' bsStyle='link' command={ viewModel.toggleSortDirection } commandParameter={ column.fieldName }>
              { headerContent }
              { sortIcon }
            </CommandButton>
          ))
        }
      </th>
    );
  }

  protected renderSortIcon(column: DataGridColumnProps, index: number, viewModel: DataGridViewModel<any>, view: DataGridView) {
    let icon: any = null;

    if (viewModel.canSort() && column.sortable) {
      let iconName = '';

      if (viewModel.isSortedBy(column.fieldName, SortDirection.Ascending) === true) {
        iconName = 'sort-asc';
      }
      else if (viewModel.isSortedBy(column.fieldName, SortDirection.Descending) === true) {
        iconName = 'sort-desc';
      }

      return (
        <span className='DataGrid-columnSortIcon'>
          { renderConditional(String.isNullOrEmpty(iconName) === false, () => (<Icon name={ iconName } size='lg' />)) }
        </span>
      );
    }

    return icon;
  }

  protected renderRows(columns: DataGridColumnProps[], viewModel: DataGridViewModel<T>, view: DataGridView) {
    return (viewModel.projectedItems() || [])
      .asEnumerable()
      .map((x, i) => this.renderRow(x, i, columns, viewModel, view))
      .defaultIfEmpty(
        <tr key='rows-empty'>
          <td colSpan={ (columns || []).length + 1 }>
            <div className='DataGrid-empty text-muted'>List is Empty...</div>
          </td>
        </tr>
      )
      .toArray();
  }

  protected renderRow(item: T, index: number, columns: DataGridColumnProps[], viewModel: DataGridViewModel<T>, view: DataGridView) {
    const rowClasses = classNames('DataGrid-row', {
      'DataGrid-row--selected': view.props.highlightSelected === true && viewModel.selectedItem() === item,
    });

    return (
      <tr className={ rowClasses } key={ this.rowKeySelector(item, index, viewModel, view) } onClick={ bindEventToCommand(this, viewModel, x => x.selectItem, x => item) }>
        {
          (columns || [])
            .asEnumerable()
            .map((x, i) => this.renderCell(x.renderCell(item, index, x, i, columns, viewModel, view), x, i, viewModel, view))
            .defaultIfEmpty(
              <td>
                <div className='DataGrid-empty text-muted'>No Columns Defined...</div>
              </td>
            )
            .toArray()
        }
      </tr>
    );
  }

  protected renderCell(value: any, column: DataGridColumnProps, index: number, viewModel: DataGridViewModel<any>, view: DataGridView) {
    return (
      <td className={ column.className } key={ index }>
        { this.renderItem(value, column, index, viewModel, view) }
      </td>
    );
  }
}

export interface DataGridViewProps extends ViewModelProps {
  fill?: boolean;
  view?: DataGridViewTemplate<any>;
  search?: boolean | SearchView;
  pager?: boolean | PagerView;
  pagerLimits?: number[];
  highlightSelected?: boolean;
  children?: DataGridColumn[];
}

export interface DataGridProps extends DataGridViewProps, BaseViewProps {
  children?: DataGridColumn[];
}

export interface DataGridSearchProps extends SearchProps {
  grid: DataGridViewModel<any>;
  view: DataGridViewTemplate<any>;
}

export class DataGridSearch extends React.Component<DataGridSearchProps, any> {
  static defaultProps = {
    fill: true,
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { grid, view } = x;
      return { grid, view };
    });

    return renderConditional(props.grid.canFilter() === true, () => (
      <SearchView { ...rest } viewModel={ props.grid.search }
        className={ classNames('DataGrid', className, { Table: props.view instanceof DataGridTableViewTemplate }) }
      />
    ));
  }
}

export interface DataGridPagerProps extends PagerProps {
  grid: DataGridViewModel<any>;
  view: DataGridViewTemplate<any>;
}

export class DataGridPager extends React.Component<DataGridPagerProps, any> {
  static defaultProps = {
    fill: true,
  };

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { grid, view } = x;
      return { grid, view };
    });

    return (
      <PagerView { ...rest } viewModel={ props.grid.pager }
        className={ classNames('DataGrid', className) }
      />
    );
  }
}

export class DataGridView extends BaseView<DataGridProps, DataGridViewModel<any>> {
  public static displayName = 'DataGridView';

  public static Search = DataGridSearch;
  public static Pager = DataGridPager;

  static defaultProps = {
    view: new DataGridTableViewTemplate<any>(),
  };

  public isOnlyView() {
    return (
      this.props != null &&
      (this.props.search == null || this.props.search === false) &&
      (this.props.pager == null || this.props.pager === false)
    );
  }

  updateOn() {
    const watches = [
      this.state.projectedItems.changed,
    ];

    if (this.props.highlightSelected === true) {
      watches.push(this.state.selectedItem.changed);
    }

    return watches;
  }

  render() {
    const { className, props, rest } = this.restProps(x => {
      const { fill, view, search, pager, pagerLimits, highlightSelected } = x;
      return { fill, view, search, pager, pagerLimits, highlightSelected };
    });

    return this.renderConditional(
      this.isOnlyView() === true,
      () => React.cloneElement(
        this.props.view.render(this.state, this),
        Object.assign({ className: classNames('DataGrid', className) }, rest),
      ),
      () => (
        <div { ...rest } className={ classNames('DataGrid', className) }>
          {
            this.renderConditional(props.search === true, () => (
              <DataGridView.Search grid={ this.state } view={ props.view } />
            ), () => props.search)
          }
          { this.props.view.render(this.state, this) }
          {
            this.renderConditional(props.pager === true, () => (
              <DataGridView.Pager grid={ this.state } view={ props.view } limits={ props.pagerLimits } />
            ), () => props.pager)
          }
        </div>
      ),
    );
  }
}
