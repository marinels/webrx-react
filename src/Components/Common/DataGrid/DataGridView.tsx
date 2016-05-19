import * as React from 'react';

import { Table, TableProps, Button, ListGroup } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { SearchView } from '../Search/SearchView';
import { PagerView } from '../Pager/PagerView';
import { Icon } from 'react-fa';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

import './DataGrid.less';

interface IDataGridColumnProps {
  fieldName: string;
  header?: string;
  valueSelector?: (x: any) => any;
  sortable?: boolean;
  className?: string;
  width?: number | string;
}

export class DataGridColumn extends React.Component<IDataGridColumnProps, any> {
  public static displayName = 'DataGridColumn';

  static defaultProps = {
    sortable: false,
  };
}

export interface IDataGridView {
  renderColumn: (view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number) => any;
  renderCell: (view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number, value: any) => any;
  renderRow: (view: DataGridView, grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) => any;
  renderTable: (view: DataGridView, grid: DataGridViewModel<any>, data: any[], columns: any[], rows: any[]) => any;
}

export class DataGridListView<T> implements IDataGridView {
  public static displayName = 'DataGridListView';

  constructor(
    protected renderItem: (view: DataGridView, grid: DataGridViewModel<T>, row: T, index: number) => any
  ) {
  }

  renderColumn(view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number): any {
    return null;
  }

  renderCell(view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number, value: any): any {
    return null;
  }

  renderRow(view: DataGridView, grid: DataGridViewModel<T>, row: T, index: number, cells: any[]) {
    return this.renderItem(view, grid, row, index);
  }

  renderTable(view: DataGridView, grid: DataGridViewModel<T>, data: T[], columns: any[], rows: any[]) {
    return (
      <div className='List'>
        <ListGroup>
          {
            (rows || [])
              .asEnumerable()
              .defaultIfEmpty(
                <div key='empty' className='DataGrid-empty text-muted'>Nothing to Display...</div>
              )
              .toArray()
          }
        </ListGroup>
      </div>
    );
  }
}

export class DataGridTableView implements IDataGridView {
  public static displayName = 'DataGridTableView';

  private tableProps: TableProps;

  constructor(
    private rowKeySelector: (row: any, index: number, cells: any[]) => any = null,
    striped = false, bordered = true, condensed = true, hover = true, responsive = true) {

    if (rowKeySelector == null) {
      this.rowKeySelector = (row: any, index: number, cells: any[]) => index;
    }

    this.tableProps = { striped, bordered, condensed, hover, responsive };
  }

  private renderSortIcon(view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number) {
    let icon: any = null;

    if (grid.canSort() && column.sortable) {
      let iconName = '';

      if (grid.isSortedBy(column.fieldName, SortDirection.Ascending) === true) {
        iconName = 'sort-asc';
      } else if (grid.isSortedBy(column.fieldName, SortDirection.Descending) === true) {
        iconName = 'sort-desc';
      }

      return (
        <span className='Column-sortIcon'>
          { String.isNullOrEmpty(iconName) ? null : <Icon name={iconName} size='lg' /> }
        </span>
      );
    }

    return icon;
  }

  public renderColumn(view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number) {
    let sortIcon = this.renderSortIcon(view, grid, column, index);
    let header = (
      <span className='Column-header'>
        {column.header}
      </span>
    );

    let headerContainer = sortIcon == null ? (
      <div className='Column'>
        {header}
      </div>
    ) : (
      <Button className='Column' bsStyle='link' onClick={view.bindEventToCommand(x => x.toggleSortDirection, () => column.fieldName)}>
        {header}
        {sortIcon}
      </Button>
    );

    return (
      <th key={index} className={column.className} width={column.width}>
        {headerContainer}
      </th>
    );
  }

  public renderCell(view: DataGridView, grid: DataGridViewModel<any>, column: IDataGridColumnProps, index: number, value: any) {
    return (
      <td className={column.className} key={index}>{value}</td>
    );
  }

  public renderRow(view: DataGridView, grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) {
    return (
      <tr className={grid.selectedItem() === row ? 'Row--selected' : null} key={this.rowKeySelector(row, index, cells)} onClick={() => grid.selectItem.execute(row)}>{cells}</tr>
    );
  }

  public renderTable(view: DataGridView, grid: DataGridViewModel<any>, data: any[], cols: any[], rows: any[]) {
    return (
      <Table {...this.tableProps as any}>
        <thead>
          <tr>
            {
              (cols || [])
                .asEnumerable()
                .defaultIfEmpty(
                  <th key='empty'>
                    <div className='DataGridView-empty text-muted'>No Columns Defined...</div>
                  </th>
                )
                .toArray()
            }
          </tr>
        </thead>
        <tbody>
          {
            (rows || [])
              .asEnumerable()
              .defaultIfEmpty(
                <tr key='empty'>
                  <td>
                    <div className='DataGridView-empty text-muted'>No Rows to Display...</div>
                  </td>
                </tr>
              )
              .toArray()
          }
        </tbody>
      </Table>
    );
  }
}

interface IDataGridProps extends IBaseViewProps {
  view?: IDataGridView;
  hideSearch?: boolean;
  pagerLimits?: number[];
  children?: DataGridColumn[];
}

export class DataGridView extends BaseView<IDataGridProps, DataGridViewModel<any>> {
  public static displayName = 'DataGridView';

  static defaultProps = {
    view: new DataGridTableView(),
    hideSearch: false,
    pagerLimits: [10, 25, null],
  };

  private columns: IDataGridColumnProps[];

  private renderTable(items: any[]) {
    let columns = this.columns.map((x, i) => this.props.view.renderColumn(this, this.state, x, i));

    let rows = items.map((row, rowIndex) => {
      let cells = this.columns.map((column, columnIndex) => {
        return this.props.view.renderCell(this, this.state, column, columnIndex, column.valueSelector(row));
      });

      return this.props.view.renderRow(this, this.state, row, rowIndex, cells);
    });

    let table = this.props.view.renderTable(this, this.state, items, columns, rows);

    return table;
  }

  private createColumns(columns: DataGridColumn[]) {
    this.columns = React.Children.map(columns, (col: React.ReactElement<IDataGridColumnProps>) => {
      let column = Object.assign<IDataGridColumnProps>({}, col.props);

      if (column.header == null) {
        column.header = column.fieldName;
      }

      if (column.valueSelector == null) {
        column.valueSelector = ((x: any) => x[column.fieldName]);
      }

      return column;
    });
  }

  updateOn() {
    return [
      this.state.projectedItems.listChanged,
      this.state.selectedItem.changed,
    ];
  }

  render() {
    let search: any;
    let table: any;
    let pager: any;

    let items = this.state.projectedItems.toArray() || [];

    if (this.columns == null) {
      let columns: DataGridColumn[];

      if (React.Children.count(this.props.children) === 0) {
        // no columns were provided, try to auto-create columns
        if (items.length > 0) {
          columns = Object
            .keys(items[0] || {})
            .map(x => (
              <DataGridColumn fieldName={x} />
            )) as any;
        }

      } else {
        // columns were provided declaratively
        columns = this.props.children;
      }

      if (columns != null) {
        this.createColumns(columns);
      }
    }

    if (this.columns != null) {
      search = (this.props.hideSearch === true || this.state.canFilter() === false) ? null : (
        <SearchView viewModel={this.state.search}/>
      );
      table = this.renderTable(items);
      pager = (
        <PagerView viewModel={this.state.pager} limits={this.props.pagerLimits} />
      );
    }

    return (
      <div className='DataGrid'>
        {search}
        {table}
        {pager}
      </div>
    );
  }
}
