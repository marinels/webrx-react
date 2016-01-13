'use strict';

import * as React from 'react';

import { Table, TableProps, ButtonGroup, Button } from 'react-bootstrap';

import { BaseView, IBaseViewProps } from '../../React/BaseView';
import { SearchView, ISearchProps } from '../Search/SearchView';
import { PagerView, IPagerProps } from '../Pager/PagerView';
import Icon from '../Icon/Icon';

import { DataGridViewModel } from './DataGridViewModel';
import { SortDirection } from '../../../Utils/Compare';

import './DataGrid.less';

interface IDataGridColumnProps {
  fieldName: string;
  header?: string;
  valueSelector?: (x: any) => any;
  sortable?: boolean;
  className?: string;
}

export class DataGridColumn extends React.Component<IDataGridColumnProps, any> {
  public static displayName = 'DataGridColumn';
}

class Column {
  public static displayName = 'Column';

  constructor(public fieldName: string, public header?: string, public valueSelector?: (x: any) => any, public sortable = false, public className?: string) {
    if (this.header == null) {
      this.header = this.fieldName;
    }

    if (this.valueSelector == null) {
      this.valueSelector = (x: any) => x[this.fieldName];
    }
  }

  public static create(element: React.ReactElement<IDataGridColumnProps>) {
    return new Column(element.props.fieldName, element.props.header, element.props.valueSelector, element.props.sortable, element.props.className);
  }
}

export interface IDataGridView {
  renderColumn: (view: DataGridView, grid: DataGridViewModel<any>, column: Column, index: number) => any;
  renderCell: (view: DataGridView, grid: DataGridViewModel<any>, column: Column, index: number, value: any) => any;
  renderRow: (view: DataGridView, grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) => any;
  renderTable: (view: DataGridView, grid: DataGridViewModel<any>, data: any[], columns: any, rows: any) => any;
}

export class TableView implements IDataGridView {
  public static displayName = 'TableView';

  constructor(
    private rowKeySelector: (row: any, index: number, cells: any[]) => any = null,
    striped = false, bordered = true, condensed = true, hover = true, responsive = true
  ) {
    if (rowKeySelector == null) {
      this.rowKeySelector = (row: any, index: number, cells: any[]) => index;
    }

    this.tableProps = { striped, bordered, condensed, hover, responsive };
  }

  private tableProps: TableProps;

  private renderSortIcon(view: DataGridView, grid: DataGridViewModel<any>, column: Column, index: number) {
    let icon:JSX.Element = null;

    if (grid.canSort() && column.sortable) {
      let iconName = '';

      if (grid.isSortedBy(column.fieldName, SortDirection.Ascending) === true) {
        iconName = 'fa-sort-asc';
      } else if (grid.isSortedBy(column.fieldName, SortDirection.Descending) === true) {
        iconName = 'fa-sort-desc';
      }

      return (
        <span className='Column-sortIcon'>
          { String.isNullOrEmpty(iconName) ? null : <Icon name={iconName} size='lg' /> }
        </span>
      )
    }

    return icon;
  }

  public renderColumn(view: DataGridView, grid: DataGridViewModel<any>, column: Column, index: number) {
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
      <Button className='Column' bsStyle='link' onClick={view.bindEvent(x => x.toggleSortDirection, x => column.fieldName)}>
        {header}
        {sortIcon}
      </Button>
    );

    return (
      <th key={index} className={column.className}>
        {headerContainer}
      </th>
    );
  }

  public renderCell(view: DataGridView, grid: DataGridViewModel<any>, column: Column, index: number, value: any) {
    return (
      <td className={column.className} key={index}>{value}</td>
    );
  }

  public renderRow(view: DataGridView, grid: DataGridViewModel<any>, row: any, index: number, cells: any[]) {
    return (
      <tr className={grid.selectedItem() === row ? 'Row--selected' : null} key={this.rowKeySelector(row, index, cells)} onClick={() => grid.selectItem.execute(row)}>{cells}</tr>
    );
  }

  public renderTable(view: DataGridView, grid: DataGridViewModel<any>, data: any[], cols: any, rows: any) {
    return (
      <Table {...this.tableProps}>
        <thead><tr>{cols}</tr></thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  }
}

interface IDataGridProps extends IBaseViewProps {
  view?: IDataGridView;
  searchProps?: ISearchProps;
  pagerProps?: IPagerProps;
  children?: DataGridColumn[];
}

export class DataGridView extends BaseView<IDataGridProps, DataGridViewModel<any>> {
  public static displayName = 'DataGridView';

  static defaultProps = {
    view: new TableView(),
    searchProps: {
    },
    pagerProps: {
      info: true,
      limits: [10, 25, null],
      first: true,
      prev: true,
      next: true,
      last: true
    }
  }

  private columns: Column[];

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

  private getColumns(items: any[]) {
    if (this.columns == null) {
      this.columns = Object
        .keys(items[0])
        .map(x => new Column(x));
    }

    return this.columns;
  }

  updateOn() {
    return [
      this.state.projectedItems.listChanged,
      this.state.selectedItem.changed
    ]
  }

  initialize() {
    super.initialize();

    if (React.Children.count(this.props.children) > 0) {
      this.columns = React.Children.map(this.props.children, (x: React.ReactElement<IDataGridColumnProps>) => {
        return Column.create(x);
      });
    }
  }

  render() {
    let search: any;
    let table: any;
    let pager: any;

    let items = this.state.projectedItems.toArray() || [];

    if (items.length > 0) {
      let columns = this.getColumns(items);

      search = (this.props.searchProps == null || this.state.canFilter() === false) ? null : (
        <SearchView {...this.props.searchProps} viewModel={this.state.search}/>
      );
      table = this.renderTable(items);
      pager = this.props.pagerProps == null ? null : (
        <PagerView {...this.props.pagerProps} viewModel={this.state.pager} />
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

export default DataGridView;
